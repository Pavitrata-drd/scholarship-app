/**
 * Migration V2 — Adds tables for:
 *   • user_profiles (preferences / onboarding)
 *   • saved_scholarships (bookmarks)
 *   • applications + application_timeline (tracker)
 *   • documents (vault)
 *   • notifications (deadline reminders)
 *   • email verification & password reset columns on users
 *
 * Run with: npm run db:migrate:v2
 */
import pool from "./pool.js";

const UP = `
-- ── user_profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  education_level VARCHAR(30) CHECK (education_level IN ('10th','12th','undergraduate','postgraduate','phd')),
  category        VARCHAR(20) CHECK (category IN ('general','obc','sc','st','ews')),
  stream          VARCHAR(100),
  state           VARCHAR(100),
  country         VARCHAR(100) DEFAULT 'India',
  institution     VARCHAR(300),
  marks           NUMERIC(5,2),
  family_income   NUMERIC(12,2),
  gender          VARCHAR(20),
  dob             DATE,
  disability      BOOLEAN DEFAULT false,
  preferred_language VARCHAR(10) DEFAULT 'en',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── saved_scholarships (bookmarks) ─────────────────────────────
CREATE TABLE IF NOT EXISTS saved_scholarships (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id  INT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  saved_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_scholarships(user_id);

-- ── applications (tracker) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scholarship_id  INT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
  status          VARCHAR(30) NOT NULL DEFAULT 'interested'
                    CHECK (status IN ('interested','applied','under_review','accepted','rejected')),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);

-- ── application_timeline ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_timeline (
  id              SERIAL PRIMARY KEY,
  application_id  INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status          VARCHAR(30) NOT NULL,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_timeline_app ON application_timeline(application_id);

-- ── documents (vault) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(300) NOT NULL,
  doc_type        VARCHAR(100),
  file_path       TEXT,
  file_size       INT,
  mime_type       VARCHAR(100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);

-- ── notifications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id              SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(300) NOT NULL,
  message         TEXT,
  type            VARCHAR(30) DEFAULT 'info'
                    CHECK (type IN ('info','deadline','status','system')),
  scholarship_id  INT REFERENCES scholarships(id) ON DELETE SET NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ── Add columns to users for email verification & password reset
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verify_otp') THEN
    ALTER TABLE users ADD COLUMN verify_otp VARCHAR(6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='verify_otp_expires') THEN
    ALTER TABLE users ADD COLUMN verify_otp_expires TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_otp') THEN
    ALTER TABLE users ADD COLUMN reset_otp VARCHAR(6);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_otp_expires') THEN
    ALTER TABLE users ADD COLUMN reset_otp_expires TIMESTAMPTZ;
  END IF;
END $$;

-- ── Triggers for updated_at ────────────────────────────────────
DROP TRIGGER IF EXISTS trg_user_profiles_updated ON user_profiles;
CREATE TRIGGER trg_user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_applications_updated ON applications;
CREATE TRIGGER trg_applications_updated
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  console.log("🔄 Running V2 migrations...");
  await pool.query(UP);
  console.log("✅ V2 migrations complete");
  await pool.end();
}

migrate().catch((err) => {
  console.error("❌ V2 Migration failed:", err);
  process.exit(1);
});
