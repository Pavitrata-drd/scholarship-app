import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "scholarhub-super-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Validation schemas ─────────────────────────────────────────

const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
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
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── POST /api/auth/register ────────────────────────────────────

router.post("/register", async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);

    // Check if email already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [body.email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(body.password, 12);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, full_name, email, role, created_at`,
      [body.full_name, body.email.toLowerCase(), password_hash]
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

export default router;
