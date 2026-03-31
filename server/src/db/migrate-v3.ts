/**
 * Migration V3 — Adds education history tracking:
 *   • education_history table (tracks education level changes)
 *   • education_history_json column in user_profiles for easy access
 *
 * Run with: npm run db:migrate:v3
 */
import pool from "./pool.js";

const UP = `
-- ── education_history ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS education_history (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  education_level VARCHAR(30) NOT NULL,
  changed_from    VARCHAR(30),
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_education_history_user ON education_history(user_id);
CREATE INDEX IF NOT EXISTS idx_education_history_date ON education_history(changed_at DESC);

-- ── Add education_history_json to user_profiles if not exists ──
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='education_history_json') THEN
    ALTER TABLE user_profiles ADD COLUMN education_history_json JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;
`;

async function migrate() {
  console.log("🔄 Running V3 migrations...");
  await pool.query(UP);
  console.log("✅ V3 migrations complete");
  await pool.end();
}

migrate().catch((err) => {
  console.error("❌ V3 Migration failed:", err);
  process.exit(1);
});
