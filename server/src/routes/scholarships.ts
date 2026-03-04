import { Router, Request, Response } from "express";
import { ZodError } from "zod";
import pool from "../db/pool.js";
import {
  scholarshipCreateSchema,
  scholarshipUpdateSchema,
  scholarshipQuerySchema,
} from "../schemas.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
type QueryParam = string | number | boolean | null;

// ─── GET /api/scholarships ────────────────────────────────────
// List with optional filtering, search, sorting and pagination
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = scholarshipQuerySchema.parse(req.query);

    const conditions: string[] = [];
    const params: QueryParam[] = [];
    let idx = 1;

    if (query.search) {
      conditions.push(
        `to_tsvector('english', coalesce(name,'') || ' ' || coalesce(provider,'') || ' ' || coalesce(description,''))
         @@ plainto_tsquery('english', $${idx})`
      );
      params.push(query.search);
      idx++;
    }

    if (query.type) {
      conditions.push(`type = $${idx}`);
      params.push(query.type);
      idx++;
    }

    if (query.category) {
      conditions.push(`category = $${idx}`);
      params.push(query.category);
      idx++;
    }

    if (query.education_level) {
      conditions.push(`education_level = $${idx}`);
      params.push(query.education_level);
      idx++;
    }

    if (query.state) {
      conditions.push(`state ILIKE $${idx}`);
      params.push(`%${query.state}%`);
      idx++;
    }

    if (query.featured !== undefined) {
      conditions.push(`is_featured = $${idx}`);
      params.push(query.featured);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM scholarships ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch page
    const offset = (query.page - 1) * query.limit;
    const sortCol = query.sort;
    const sortOrder = query.order.toUpperCase();

    const dataResult = await pool.query(
      `SELECT * FROM scholarships ${where}
       ORDER BY ${sortCol} ${sortOrder}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, query.limit, offset]
    );

    res.json({
      data: dataResult.rows,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Invalid query parameters", details: err.errors });
    }
    console.error("GET /api/scholarships error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/scholarships/featured ───────────────────────────
router.get("/featured", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM scholarships WHERE is_featured = true ORDER BY deadline ASC LIMIT 10`
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/scholarships/featured error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/scholarships/stats ──────────────────────────────
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int                                 AS total_scholarships,
        COALESCE(SUM(amount), 0)::bigint              AS total_funding,
        COUNT(DISTINCT provider)::int                  AS total_providers,
        COUNT(*) FILTER (WHERE deadline >= NOW())::int AS active_scholarships
      FROM scholarships
    `);
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("GET /api/scholarships/stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/scholarships/:id ────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM scholarships WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("GET /api/scholarships/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/scholarships (admin only) ─────────────────────
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const body = scholarshipCreateSchema.parse(req.body);

    const result = await pool.query(
      `INSERT INTO scholarships
        (name, provider, description, amount, currency, deadline, type, category,
         education_level, stream, state, country, official_url,
         is_featured, documents_required, eligibility_criteria)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        body.name,
        body.provider,
        body.description,
        body.amount,
        body.currency,
        body.deadline || null,
        body.type,
        body.category || null,
        body.education_level || null,
        body.stream || null,
        body.state || null,
        body.country,
        body.official_url || null,
        body.is_featured,
        body.documents_required || null,
        body.eligibility_criteria || null,
      ]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("POST /api/scholarships error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/scholarships/:id (admin only) ──────────────────
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = scholarshipUpdateSchema.parse(req.body);

    // Build dynamic SET clause
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        setClauses.push(`${key} = $${idx}`);
        params.push(value);
        idx++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE scholarships SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("PUT /api/scholarships/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/scholarships/:id (admin only) ───────────────
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM scholarships WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Scholarship not found" });
    }

    res.json({ message: "Scholarship deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("DELETE /api/scholarships/:id error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
