import { Router, Request, Response } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const VALID_STATUSES = ["interested", "applied", "under_review", "accepted", "rejected"];

// ── GET /api/applications — list user's applications ───────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.*, s.name AS scholarship_name, s.provider, s.amount,
              s.deadline, s.type, s.official_url
       FROM applications a
       JOIN scholarships s ON s.id = a.scholarship_id
       WHERE a.user_id = $1
       ORDER BY a.updated_at DESC`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/applications — start tracking a scholarship ──────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const { scholarship_id, status = "interested", notes = "" } = req.body;
    if (!scholarship_id) {
      return res.status(400).json({ error: "scholarship_id is required" });
    }

    const result = await pool.query(
      `INSERT INTO applications (user_id, scholarship_id, status, notes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, scholarship_id) DO UPDATE SET status = $3, notes = $4
       RETURNING *`,
      [req.user!.id, scholarship_id, status, notes]
    );

    // Add timeline entry
    await pool.query(
      `INSERT INTO application_timeline (application_id, status, note)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, status, notes || `Marked as ${status}`]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("POST /api/applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/applications/:id — update application status ──────
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const setClauses: string[] = [];
    const params: (string | number)[] = [];
    let idx = 1;

    if (status) {
      setClauses.push(`status = $${idx}`);
      params.push(status);
      idx++;
    }
    if (notes !== undefined) {
      setClauses.push(`notes = $${idx}`);
      params.push(notes);
      idx++;
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    params.push(id, req.user!.id);
    const result = await pool.query(
      `UPDATE applications SET ${setClauses.join(", ")}
       WHERE id = $${idx} AND user_id = $${idx + 1}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Add timeline entry
    if (status) {
      await pool.query(
        `INSERT INTO application_timeline (application_id, status, note)
         VALUES ($1, $2, $3)`,
        [id, status, notes || `Status changed to ${status}`]
      );
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/applications/:id/timeline — get timeline ──────────
router.get("/:id/timeline", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const app = await pool.query(
      "SELECT id FROM applications WHERE id = $1 AND user_id = $2",
      [id, req.user!.id]
    );
    if (app.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    const result = await pool.query(
      "SELECT * FROM application_timeline WHERE application_id = $1 ORDER BY created_at ASC",
      [id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/applications/:id/timeline error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── DELETE /api/applications/:id — remove application ──────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM applications WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ message: "Application removed" });
  } catch (err) {
    console.error("DELETE /api/applications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
