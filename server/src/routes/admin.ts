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

// ── GET /api/admin/users/:userId — detailed user profile ──────
router.get("/users/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (!userId) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    // 1. User basic info
    const userRes = await pool.query(
      `SELECT id, full_name, email, role, email_verified, created_at FROM users WHERE id = $1`,
      [userId]
    );
    
    if (userRes.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userRes.rows[0];

    // 2. User profile details
    const profileRes = await pool.query(
      `SELECT * FROM user_profiles WHERE user_id = $1`,
      [userId]
    );
    const profile = profileRes.rows[0] || null;

    // 3. Saved scholarships
    const savedRes = await pool.query(
      `SELECT ss.id, ss.saved_at, s.id as scholarship_id, s.name, s.provider, s.amount, s.deadline
       FROM saved_scholarships ss
       JOIN scholarships s ON s.id = ss.scholarship_id
       WHERE ss.user_id = $1
       ORDER BY ss.saved_at DESC`,
      [userId]
    );

    // 4. Applications with latest status
    const applicationsRes = await pool.query(
      `SELECT a.id, a.status, a.created_at, a.updated_at, a.notes,
              s.id as scholarship_id, s.name, s.provider, s.amount
       FROM applications a
       JOIN scholarships s ON s.id = a.scholarship_id
       WHERE a.user_id = $1
       ORDER BY a.updated_at DESC`,
      [userId]
    );

    // 5. Application timeline for all applications
    const timelineRes = await pool.query(
      `SELECT at.id, at.application_id, at.status, at.note, at.created_at,
              a.scholarship_id, s.name as scholarship_name
       FROM application_timeline at
       JOIN applications a ON a.id = at.application_id
       JOIN scholarships s ON s.id = a.scholarship_id
       WHERE a.user_id = $1
       ORDER BY at.created_at DESC`,
      [userId]
    );

    // 6. Documents uploaded
    const documentsRes = await pool.query(
      `SELECT id, name, doc_type, file_size, mime_type, created_at
       FROM documents
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // 7. Activity summary
    const statsRes = await pool.query(
      `SELECT
        (SELECT COUNT(*)::int FROM saved_scholarships WHERE user_id = $1) AS total_saved,
        (SELECT COUNT(*)::int FROM applications WHERE user_id = $1) AS total_applications,
        (SELECT COUNT(*)::int FROM documents WHERE user_id = $1) AS total_documents,
        (SELECT COUNT(*)::int FROM notifications WHERE user_id = $1 AND is_read = false) AS unread_notifications
       `,
      [userId]
    );
    const stats = statsRes.rows[0];

    res.json({
      data: {
        user,
        profile,
        saved_scholarships: savedRes.rows,
        applications: applicationsRes.rows,
        timeline: timelineRes.rows,
        documents: documentsRes.rows,
        stats,
      },
    });
  } catch (err) {
    console.error("GET /api/admin/users/:userId error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
