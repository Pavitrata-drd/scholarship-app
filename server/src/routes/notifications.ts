import { Router, Request, Response } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { sendDeadlineReminderEmail, sendNotificationEmail } from "../utils/emailNotifications.js";

const router = Router();

// ── GET /api/notifications — list user's notifications ─────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT n.*, s.name AS scholarship_name
       FROM notifications n
       LEFT JOIN scholarships s ON s.id = n.scholarship_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user!.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/notifications/unread-count ────────────────────────
router.get("/unread-count", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false",
      [req.user!.id]
    );
    res.json({ count: result.rows[0].count });
  } catch (err) {
    console.error("GET /api/notifications/unread-count error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/notifications/:id/read — mark as read ─────────────
router.put("/:id/read", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
      [id, req.user!.id]
    );
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error("PUT /api/notifications/:id/read error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/notifications/read-all — mark all as read ─────────
router.put("/read-all", requireAuth, async (req: Request, res: Response) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [req.user!.id]
    );
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("PUT /api/notifications/read-all error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/notifications/generate-deadline-reminders ────────
// This generates deadline reminder notifications + sends emails
router.post("/generate-deadline-reminders", requireAuth, async (req: Request, res: Response) => {
  try {
    // Get user email
    const userResult = await pool.query(
      "SELECT email FROM users WHERE id = $1",
      [req.user!.id]
    );
    const userEmail = userResult.rows[0]?.email;

    // Find applications with deadlines in 1 or 7 days
    const result = await pool.query(
      `SELECT a.id AS app_id, s.id, s.name, s.deadline, s.official_url
       FROM applications a
       JOIN scholarships s ON s.id = a.scholarship_id
       WHERE a.user_id = $1
         AND s.deadline IS NOT NULL
         AND s.deadline >= CURRENT_DATE
         AND (
           s.deadline = CURRENT_DATE + INTERVAL '1 day'
           OR s.deadline = CURRENT_DATE + INTERVAL '7 days'
         )
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = $1
             AND n.scholarship_id = s.id
             AND n.type = 'deadline'
             AND n.created_at >= CURRENT_DATE
         )`,
      [req.user!.id]
    );

    const notifications: Array<Record<string, unknown>> = [];
    const emailsSent: string[] = [];

    for (const s of result.rows) {
      const daysLeft = Math.ceil(
        (new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      const title = daysLeft <= 1
        ? `🚨 Last day to apply: ${s.name}`
        : `⏰ ${daysLeft} days left: ${s.name}`;
      const message = daysLeft <= 1
        ? `The deadline for "${s.name}" is tomorrow! Apply now before it's too late.`
        : `The deadline for "${s.name}" is in ${daysLeft} days. Don't miss out!`;

      // Create in-app notification
      const ins = await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, scholarship_id)
         VALUES ($1, $2, $3, 'deadline', $4)
         RETURNING *`,
        [req.user!.id, title, message, s.id]
      );
      notifications.push(ins.rows[0]);

      // Send email reminder
      if (userEmail) {
        const emailSent = await sendDeadlineReminderEmail(
          userEmail,
          s.name,
          s.deadline,
          daysLeft,
          s.official_url
        );
        if (emailSent) {
          emailsSent.push(s.name);
        }
      }
    }

    res.json({
      data: notifications,
      generated: notifications.length,
      emails_sent: emailsSent.length,
      message: `${notifications.length} notification(s) created, ${emailsSent.length} email(s) sent`,
    });
  } catch (err) {
    console.error("POST /api/notifications/generate-deadline-reminders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/notifications/send-all-reminders ────────────────
// Send deadline reminders to ALL users (for cron jobs) - requires API key
router.post("/send-all-reminders", async (req: Request, res: Response) => {
  try {
    // Simple auth check - use an API key from environment
    const apiKey = req.headers["x-api-key"] as string;
    if (apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get all users with upcoming deadline applications
    const usersResult = await pool.query(
      `SELECT DISTINCT u.id, u.email
       FROM users u
       JOIN applications a ON a.user_id = u.id
       JOIN scholarships s ON s.id = a.scholarship_id
       WHERE s.deadline IS NOT NULL
         AND s.deadline >= CURRENT_DATE
         AND (
           s.deadline = CURRENT_DATE + INTERVAL '1 day'
           OR s.deadline = CURRENT_DATE + INTERVAL '7 days'
         )
         AND NOT EXISTS (
           SELECT 1 FROM notifications n
           WHERE n.user_id = u.id
             AND n.scholarship_id = s.id
             AND n.type = 'deadline'
             AND n.created_at >= CURRENT_DATE
         )`
    );

    let totalNotifications = 0;
    let totalEmails = 0;
    const results: Array<{ user_id: number; email: string; notifications: number; emails: number }> = [];

    for (const user of usersResult.rows) {
      const appResult = await pool.query(
        `SELECT s.id, s.name, s.deadline, s.official_url
         FROM applications a
         JOIN scholarships s ON s.id = a.scholarship_id
         WHERE a.user_id = $1
           AND s.deadline IS NOT NULL
           AND s.deadline >= CURRENT_DATE
           AND (
             s.deadline = CURRENT_DATE + INTERVAL '1 day'
             OR s.deadline = CURRENT_DATE + INTERVAL '7 days'
           )
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.user_id = $1
               AND n.scholarship_id = s.id
               AND n.type = 'deadline'
               AND n.created_at >= CURRENT_DATE
           )`,
        [user.id]
      );

      let userNotifications = 0;
      let userEmails = 0;

      for (const s of appResult.rows) {
        const daysLeft = Math.ceil(
          (new Date(s.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        const title = daysLeft <= 1
          ? `🚨 Last day to apply: ${s.name}`
          : `⏰ ${daysLeft} days left: ${s.name}`;
        const message = daysLeft <= 1
          ? `The deadline for "${s.name}" is tomorrow! Apply now before it's too late.`
          : `The deadline for "${s.name}" is in ${daysLeft} days. Don't miss out!`;

        // Create notification
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, scholarship_id)
           VALUES ($1, $2, $3, 'deadline', $4)`,
          [user.id, title, message, s.id]
        );
        userNotifications++;

        // Send email
        const emailSent = await sendDeadlineReminderEmail(
          user.email,
          s.name,
          s.deadline,
          daysLeft,
          s.official_url
        );
        if (emailSent) userEmails++;
      }

      totalNotifications += userNotifications;
      totalEmails += userEmails;
      results.push({
        user_id: user.id,
        email: user.email,
        notifications: userNotifications,
        emails: userEmails,
      });
    }

    res.json({
      total_users: usersResult.rows.length,
      total_notifications: totalNotifications,
      total_emails: totalEmails,
      users: results,
    });
  } catch (err) {
    console.error("POST /api/notifications/send-all-reminders error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
