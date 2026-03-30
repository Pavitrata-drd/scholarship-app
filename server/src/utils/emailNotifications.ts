import nodemailer from "nodemailer";

// ── Email transporter configuration ────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

const emailConfigured = !!(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// ── Send deadline reminder email ────────────────────────────────
export async function sendDeadlineReminderEmail(
  userEmail: string,
  scholarshipName: string,
  deadline: string,
  daysLeft: number,
  scholarshipUrl?: string
): Promise<boolean> {
  if (!transporter) {
    console.log(
      `[DEV EMAIL] Deadline reminder: ${scholarshipName} (${daysLeft} days left)`
    );
    return false;
  }

  try {
    const isLastDay = daysLeft <= 1;
    const subject = isLastDay
      ? `🚨 Last day to apply: ${scholarshipName}`
      : `⏰ Deadline approaching: ${scholarshipName} (${daysLeft} days left)`;

    const urgencyMessage = isLastDay
      ? "This is your LAST chance to apply!"
      : `Apply before the deadline on ${new Date(deadline).toLocaleDateString()}`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#6366f1;color:white;padding:16px;border-radius:8px;margin-bottom:16px">
          <h2 style="margin:0">${isLastDay ? "🚨 URGENT" : "⏰ DEADLINE REMINDER"}</h2>
        </div>
        
        <p>Hi,</p>
        
        <p><strong>${urgencyMessage}</strong></p>
        
        <div style="background:#f1f5f9;padding:16px;border-left:4px solid #6366f1;border-radius:4px;margin:16px 0">
          <p style="margin:0"><strong>Scholarship:</strong> ${scholarshipName}</p>
          <p style="margin:4px 0;color:#64748b"><strong>Deadline:</strong> ${new Date(deadline).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
          <p style="margin:4px 0;color:#64748b"><strong>Days Left:</strong> ${daysLeft}</p>
        </div>

        <p>Don't miss this opportunity! Here's what you can do:</p>
        <ul style="color:#475569">
          <li>Review the scholarship details and eligibility criteria</li>
          <li>Prepare all required documents</li>
          <li>Submit your application before the deadline</li>
        </ul>

        ${
          scholarshipUrl
            ? `<a href="${scholarshipUrl}" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin:16px 0;font-weight:bold">View Scholarship & Apply</a>`
            : ""
        }

        <p style="color:#64748b;font-size:14px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
          You received this email because you have this scholarship in your applications. 
          <br/>To manage your notifications, visit your ScholarHub dashboard.
        </p>

        <p style="color:#94a3b8;font-size:12px">
          © ScholarHub ${new Date().getFullYear()} | India's #1 Scholarship Platform
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: SMTP_FROM,
      to: userEmail,
      subject,
      html,
    });

    console.log(`✅ Deadline reminder sent to ${userEmail}: ${scholarshipName}`);
    return true;
  } catch (err) {
    console.error("Error sending deadline reminder email:", err);
    return false;
  }
}

// ── Send general notification email ────────────────────────────
export async function sendNotificationEmail(
  userEmail: string,
  title: string,
  message: string
): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV EMAIL] Notification: ${title}`);
    return false;
  }

  try {
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
        <div style="background:#6366f1;color:white;padding:16px;border-radius:8px;margin-bottom:16px">
          <h2 style="margin:0">${title}</h2>
        </div>
        
        <p>${message}</p>

        <p style="color:#64748b;font-size:14px;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px">
          © ScholarHub ${new Date().getFullYear()} | India's #1 Scholarship Platform
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: SMTP_FROM,
      to: userEmail,
      subject: title,
      html,
    });

    console.log(`✅ Notification sent to ${userEmail}: ${title}`);
    return true;
  } catch (err) {
    console.error("Error sending notification email:", err);
    return false;
  }
}
