import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import {
  canonicalizeFullName,
  isSuspiciousRepeatedName,
  normalizeEmail,
  normalizeFullName,
} from "../utils/nameSecurity.js";

const router = Router();

// ── Email transporter (configure SMTP_* in .env for real emails) ──
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

async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    console.log(`[DEV EMAIL] To: ${to} | Subject: ${subject}`);
    return false; // not sent
  }
  await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
  return true; // sent
}

const JWT_SECRET = process.env.JWT_SECRET || "scholarhub-super-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Validation schemas ─────────────────────────────────────────

const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name is too long")
    .transform((v) => normalizeFullName(v)),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

// ── Helper to generate token ───────────────────────────────────

function signToken(user: { id: number; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

// ── POST /api/auth/register ────────────────────────────────────

router.post("/register", async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const normalizedEmail = normalizeEmail(body.email);
    const normalizedFullName = normalizeFullName(body.full_name);
    const canonicalName = canonicalizeFullName(normalizedFullName);

    if (isSuspiciousRepeatedName(normalizedFullName)) {
      return res.status(400).json({
        error: "Please enter a valid full name",
      });
    }

    // Check if email already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Prevent multiple accounts reusing the same full name.
    const sameNameExisting = await pool.query(
      `SELECT id
       FROM users
       WHERE regexp_replace(lower(trim(full_name)), '\\s+', ' ', 'g') = $1
       LIMIT 1`,
      [canonicalName]
    );

    if (sameNameExisting.rows.length > 0) {
      return res.status(409).json({
        error: "This full name is already registered",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(body.password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, full_name, email, role, created_at`,
      [normalizedFullName, normalizedEmail, password_hash]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    if ((err as { code?: string; constraint?: string }).code === "23505") {
      const pgErr = err as { constraint?: string };
      if (pgErr.constraint === "users_email_unique" || pgErr.constraint === "users_email_key") {
        return res.status(409).json({ error: "Email already registered" });
      }
      if (pgErr.constraint === "users_full_name_canonical_unique") {
        return res.status(409).json({ error: "This full name is already registered" });
      }
    }
    console.error("POST /api/auth/register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────

router.post("/login", async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [body.email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);

    res.json({
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("POST /api/auth/login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/auth/me ───────────────────────────────────────────

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, full_name, email, role, created_at FROM users WHERE id = $1",
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Helper to generate 6-digit OTP ────────────────────────────
function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// ── POST /api/auth/send-verify-otp — send email verification ──
router.post("/send-verify-otp", requireAuth, async (req: Request, res: Response) => {
  try {
    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await pool.query(
      "UPDATE users SET verify_otp = $1, verify_otp_expires = $2 WHERE id = $3",
      [otp, expires, req.user!.id]
    );

    // Send via email if SMTP is configured
    const emailSent = await sendEmail(
      req.user!.email,
      "ScholarHub — Verify Your Email",
      `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;
                    padding:16px;background:#f1f5f9;border-radius:8px;margin:16px 0">${otp}</div>
        <p style="color:#64748b;font-size:14px">This code expires in 10 minutes.</p>
      </div>`
    );

    console.log(`[Verify OTP] User ${req.user!.email}: ${otp}`);
    res.json({
      message: emailSent ? "Verification OTP sent to your email" : "OTP generated (check dev console)",
      ...(!emailSent && { _dev_otp: otp }),
    });
  } catch (err) {
    console.error("POST /api/auth/send-verify-otp error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/verify-email — verify with OTP ─────────────
router.post("/verify-email", requireAuth, async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: "OTP is required" });

    const result = await pool.query(
      "SELECT verify_otp, verify_otp_expires FROM users WHERE id = $1",
      [req.user!.id]
    );

    const user = result.rows[0];
    if (!user || user.verify_otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(user.verify_otp_expires) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    await pool.query(
      "UPDATE users SET email_verified = true, verify_otp = NULL, verify_otp_expires = NULL WHERE id = $1",
      [req.user!.id]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("POST /api/auth/verify-email error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/forgot-password — send reset OTP ────────────
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const result = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: "If the email exists, a reset OTP has been sent" });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      "UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3",
      [otp, expires, result.rows[0].id]
    );

    const emailSent = await sendEmail(
      email,
      "ScholarHub — Password Reset",
      `<div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:20px">
        <h2 style="color:#6366f1">Password Reset</h2>
        <p>Your reset code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;
                    padding:16px;background:#f1f5f9;border-radius:8px;margin:16px 0">${otp}</div>
        <p style="color:#64748b;font-size:14px">This code expires in 10 minutes.</p>
      </div>`
    );

    console.log(`[Reset OTP] ${email}: ${otp}`);
    res.json({
      message: "If the email exists, a reset OTP has been sent",
      ...(!emailSent && { _dev_otp: otp }),
    });
  } catch (err) {
    console.error("POST /api/auth/forgot-password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/auth/reset-password — reset with OTP ─────────────
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) {
      return res.status(400).json({ error: "email, otp, and new_password are required" });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const result = await pool.query(
      "SELECT id, reset_otp, reset_otp_expires FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const user = result.rows[0];
    if (user.reset_otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (new Date(user.reset_otp_expires) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    const password_hash = await bcrypt.hash(new_password, 12);
    await pool.query(
      "UPDATE users SET password_hash = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE id = $2",
      [password_hash, user.id]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("POST /api/auth/reset-password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
