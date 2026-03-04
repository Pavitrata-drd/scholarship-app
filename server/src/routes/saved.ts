import { Router, Request, Response } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// ── GET /api/saved — list user's saved scholarships ────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, ss.saved_at
       FROM saved_scholarships ss
       JOIN scholarships s ON s.id = ss.scholarship_id
       WHERE ss.user_id = $1
       ORDER BY ss.saved_at DESC`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/saved error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/saved — bookmark a scholarship ───────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarship_id } = req.body;
    if (!scholarship_id) {
      return res.status(400).json({ error: "scholarship_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO saved_scholarships (user_id, scholarship_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, scholarship_id) DO NOTHING
       RETURNING *`,
      [req.user!.id, scholarship_id]
    );

    res.status(201).json({ data: result.rows[0] ?? { already_saved: true } });
  } catch (err) {
    console.error("POST /api/saved error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/saved/:scholarshipId — unsave ──────────────────
router.delete("/:scholarshipId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarshipId } = req.params;
    await pool.query(
      "DELETE FROM saved_scholarships WHERE user_id = $1 AND scholarship_id = $2",
      [req.user!.id, scholarshipId]
    );
    res.json({ message: "Removed from saved" });
  } catch (err) {
    console.error("DELETE /api/saved error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/saved/check/:scholarshipId — check if saved ──────
router.get("/check/:scholarshipId", requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarshipId } = req.params;
    const result = await pool.query(
      "SELECT 1 FROM saved_scholarships WHERE user_id = $1 AND scholarship_id = $2",
      [req.user!.id, scholarshipId]
    );
    res.json({ saved: result.rows.length > 0 });
  } catch (err) {
    console.error("GET /api/saved/check error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
