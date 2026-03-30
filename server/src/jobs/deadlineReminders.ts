import cron from "node-cron";
import pool from "../db/pool.js";
import {
  sendDeadlineReminderEmail,
} from "../utils/emailNotifications.js";

// ── Run daily at 8 AM ──
// Schedule: 0 8 * * * (8 AM every day)
export function startDeadlineReminderJob() {
  // For testing: run every minute
  // cron.schedule("* * * * *", async () => {

  // For production: run daily at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Starting deadline reminder job...");

    try {
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

      let totalSent = 0;

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

        for (const s of appResult.rows) {
          const daysLeft = Math.ceil(
            (new Date(s.deadline).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );
          const title =
            daysLeft <= 1
              ? `🚨 Last day to apply: ${s.name}`
              : `⏰ ${daysLeft} days left: ${s.name}`;
          const message =
            daysLeft <= 1
              ? `The deadline for "${s.name}" is tomorrow! Apply now before it's too late.`
              : `The deadline for "${s.name}" is in ${daysLeft} days. Don't miss out!`;

          // Create notification
          await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, scholarship_id)
             VALUES ($1, $2, $3, 'deadline', $4)`,
            [user.id, title, message, s.id]
          );

          // Send email
          const emailSent = await sendDeadlineReminderEmail(
            user.email,
            s.name,
            s.deadline,
            daysLeft,
            s.official_url
          );

          if (emailSent) totalSent++;
        }
      }

      console.log(`✅ Cron job completed: ${totalSent} emails sent`);
    } catch (err) {
      console.error("[Cron] Error in deadline reminder job:", err);
    }
  });

  console.log("✅ Deadline reminder job scheduled (daily at 8 AM)");
}
