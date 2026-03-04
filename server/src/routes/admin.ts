import { Router, Request, Response } from "express";
import pool from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// ── GET /api/admin/analytics — dashboard charts data ───────────
router.get("/analytics", async (_req: Request, res: Response) => {
  try {
    // 1. Registrations over time (last 30 days)
    const registrations = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // 2. Scholarship type distribution
    const typeDistribution = await pool.query(`
      SELECT type, COUNT(*)::int AS count
      FROM scholarships
      GROUP BY type
      ORDER BY count DESC
    `);

    // 3. Category distribution
    const categoryDistribution = await pool.query(`
      SELECT COALESCE(category, 'uncategorized') AS category, COUNT(*)::int AS count
      FROM scholarships
      GROUP BY category
      ORDER BY count DESC
    `);

    // 4. Application status breakdown
    const applicationStats = await pool.query(`
      SELECT status, COUNT(*)::int AS count
      FROM applications
      GROUP BY status
      ORDER BY count DESC
    `);

    // 5. Most saved scholarships (popular)
    const popularScholarships = await pool.query(`
      SELECT s.id, s.name, s.provider, COUNT(ss.id)::int AS save_count
      FROM saved_scholarships ss
      JOIN scholarships s ON s.id = ss.scholarship_id
      GROUP BY s.id, s.name, s.provider
      ORDER BY save_count DESC
      LIMIT 10
    `);

    // 6. Total counts
    const totals = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users) AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
        (SELECT COUNT(*)::int FROM scholarships) AS total_scholarships,
        (SELECT COUNT(*)::int FROM applications) AS total_applications,
        (SELECT COUNT(*)::int FROM saved_scholarships) AS total_saves,
        (SELECT COUNT(*)::int FROM documents) AS total_documents
    `);

    // 7. Education level distribution from profiles
    const educationStats = await pool.query(`
      SELECT COALESCE(education_level, 'not set') AS education_level, COUNT(*)::int AS count
      FROM user_profiles
      GROUP BY education_level
      ORDER BY count DESC
    `);

    // 8. Applications over time (last 30 days)
    const applicationsOverTime = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*)::int AS count
      FROM applications
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      data: {
        registrations: registrations.rows,
        typeDistribution: typeDistribution.rows,
        categoryDistribution: categoryDistribution.rows,
        applicationStats: applicationStats.rows,
        popularScholarships: popularScholarships.rows,
        totals: totals.rows[0],
        educationStats: educationStats.rows,
        applicationsOverTime: applicationsOverTime.rows,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/analytics error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/admin/users — list all users (admin) ──────────────
router.get("/users", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*)::int AS total FROM users");
    const result = await pool.query(
      `SELECT id, full_name, email, role, email_verified, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      data: result.rows,
      meta: {
        total: countResult.rows[0].total,
        page,
        limit,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
