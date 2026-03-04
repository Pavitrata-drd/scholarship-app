import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, PNG, DOC files are allowed"));
    }
  },
});

const router = Router();

// ── GET /api/documents — list user's documents ─────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/documents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/documents — upload a document ────────────────────
router.post("/", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { doc_type } = req.body;

    const result = await pool.query(
      `INSERT INTO documents (user_id, name, doc_type, file_path, file_size, mime_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.user!.id,
        file.originalname,
        doc_type || "other",
        file.filename,
        file.size,
        file.mimetype,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("POST /api/documents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/documents/:id/download — download a document ──────
router.get("/:id/download", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    const doc = result.rows[0];
    const filePath = path.join(uploadDir, doc.file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(filePath, doc.name);
  } catch (err) {
    console.error("GET /api/documents/:id/download error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/documents/:id — delete a document ──────────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Remove file from disk
    const doc = result.rows[0];
    const filePath = path.join(uploadDir, doc.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error("DELETE /api/documents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
