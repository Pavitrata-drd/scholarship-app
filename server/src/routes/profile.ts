import { Router, Request, Response } from "express";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { isSuspiciousRepeatedName, normalizeFullName } from "../utils/nameSecurity.js";

const router = Router();

// Age limits for each education level
const AGE_LIMITS: Record<string, { min: number; max: number }> = {
  "10th": { min: 14, max: 17 },
  "12th": { min: 16, max: 19 },
  "undergraduate": { min: 17, max: 23 },
  "postgraduate": { min: 23, max: 26 },
  "phd": { min: 26, max: 45 },
};

// Minimum passing percentage for SCHOOL levels
const PASSING_PERCENTAGE: Record<string, number> = {
  "10th": 35,
  "12th": 35,
};

// Minimum passing CGPA for COLLEGE levels (out of 10)
const PASSING_CGPA: Record<string, number> = {
  "undergraduate": 5.0,
  "postgraduate": 5.0,
  "phd": 5.0,
};

// Calculate age from DOB
const calculateAge = (dobString: string): number => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

// ── GET /api/profile — get current user's profile ──────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT up.*, u.full_name, u.email, u.email_verified
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.id = $1`,
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("GET /api/profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PUT /api/profile — create or update profile ────────────────
router.put("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      education_level,
      category,
      stream,
      state,
      country,
      institution,
      marks,
      family_income,
      gender,
      dob,
      disability,
      preferred_language,
    } = req.body;

    // Validation: Check marks based on education level
    if (marks !== null && marks !== undefined) {
      const marksNum = Number(marks);
      const isSchoolLevel = education_level === "10th" || education_level === "12th";
      
      if (isSchoolLevel) {
        // Validation for school level (Percentage: 0-100)
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
          return res.status(400).json({ error: "Percentage must be between 0 and 100" });
        }
        
        // Check minimum passing percentage
        if (marksNum > 0 && education_level) {
          const passingPercentage = PASSING_PERCENTAGE[education_level];
          if (passingPercentage && marksNum < passingPercentage) {
            const levelLabel = education_level === "10th" ? "10th Standard" : "12th Standard";
            return res.status(400).json({ 
              error: `You failed - minimum passing percentage for ${levelLabel} is ${passingPercentage}%` 
            });
          }
        }
      } else if (education_level) {
        // Validation for college level (CGPA: 0-10)
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 10) {
          return res.status(400).json({ error: "CGPA must be between 0 and 10" });
        }
        
        // Check minimum passing CGPA
        if (marksNum > 0) {
          const passingCGPA = PASSING_CGPA[education_level];
          if (passingCGPA && marksNum < passingCGPA) {
            const levelLabel = 
              education_level === "undergraduate" ? "Undergraduate" :
              education_level === "postgraduate" ? "Postgraduate" :
              "PhD";
            return res.status(400).json({ 
              error: `You failed - minimum passing CGPA for ${levelLabel} is ${passingCGPA}` 
            });
          }
        }
      }
    }

    // Validation: Check age based on education level
    if (dob && education_level) {
      const age = calculateAge(dob);
      const limits = AGE_LIMITS[education_level];
      if (limits && (age < limits.min || age > limits.max)) {
        const levelLabel = 
          education_level === "10th" ? "10th Standard" :
          education_level === "12th" ? "12th Standard" :
          education_level === "undergraduate" ? "Undergraduate" :
          education_level === "postgraduate" ? "Postgraduate" :
          "PhD";
        return res.status(400).json({ 
          error: `Age should be between ${limits.min} to ${limits.max} years for ${levelLabel}` 
        });
      }
    }

    // Upsert
    const result = await pool.query(
      `INSERT INTO user_profiles
        (user_id, education_level, category, stream, state, country,
         institution, marks, family_income, gender, dob, disability, preferred_language)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (user_id) DO UPDATE SET
         education_level = EXCLUDED.education_level,
         category = EXCLUDED.category,
         stream = EXCLUDED.stream,
         state = EXCLUDED.state,
         country = EXCLUDED.country,
         institution = EXCLUDED.institution,
         marks = EXCLUDED.marks,
         family_income = EXCLUDED.family_income,
         gender = EXCLUDED.gender,
         dob = EXCLUDED.dob,
         disability = EXCLUDED.disability,
         preferred_language = EXCLUDED.preferred_language
       RETURNING *`,
      [
        req.user!.id,
        education_level || null,
        category || null,
        stream || null,
        state || null,
        country || "India",
        institution || null,
        marks || null,
        family_income || null,
        gender || null,
        dob || null,
        disability || false,
        preferred_language || "en",
      ]
    );

    // Also update full_name if provided
    if (req.body.full_name) {
      const normalizedName = normalizeFullName(String(req.body.full_name));
      if (isSuspiciousRepeatedName(normalizedName)) {
        return res.status(400).json({ error: "Please enter a valid full name" });
      }

      await pool.query("UPDATE users SET full_name = $1 WHERE id = $2", [
        normalizedName,
        req.user!.id,
      ]);
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /api/profile/recommendations — AI-matched scholarships ─
router.get("/recommendations", requireAuth, async (req: Request, res: Response) => {
  try {
    // Get user profile
    const profileResult = await pool.query(
      "SELECT * FROM user_profiles WHERE user_id = $1",
      [req.user!.id]
    );

    if (profileResult.rows.length === 0) {
      return res.json({ data: [] });
    }

    const profile = profileResult.rows[0];

    // Build a smart query based on user profile
    const conditions: string[] = [];
    const params: (string | number | boolean | null)[] = [];
    let idx = 1;

    // Active scholarships only
    conditions.push("deadline >= NOW()");

    if (profile.education_level) {
      conditions.push(`(education_level = $${idx} OR education_level IS NULL)`);
      params.push(profile.education_level);
      idx++;
    }

    if (profile.category) {
      conditions.push(`(category = $${idx} OR category IS NULL OR category = 'general')`);
      params.push(profile.category);
      idx++;
    }

    if (profile.state) {
      conditions.push(`(state ILIKE $${idx} OR state IS NULL)`);
      params.push(`%${profile.state}%`);
      idx++;
    }

    if (profile.stream) {
      conditions.push(`(stream ILIKE $${idx} OR stream IS NULL)`);
      params.push(`%${profile.stream}%`);
      idx++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `SELECT *, 
        (CASE WHEN education_level = $${idx} THEN 25 ELSE 0 END +
         CASE WHEN category = $${idx + 1} THEN 25 ELSE 0 END +
         CASE WHEN state ILIKE $${idx + 2} THEN 25 ELSE 0 END +
         CASE WHEN stream ILIKE $${idx + 3} THEN 15 ELSE 0 END +
         CASE WHEN is_featured THEN 10 ELSE 0 END) AS match_score
       FROM scholarships ${where}
       ORDER BY match_score DESC, deadline ASC
       LIMIT 10`,
      [
        ...params,
        profile.education_level || "",
        profile.category || "",
        `%${profile.state || ""}%`,
        `%${profile.stream || ""}%`,
      ]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error("GET /api/profile/recommendations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
