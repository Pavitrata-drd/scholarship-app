/**
 * Database migration — creates all tables.
 * Run with: npm run db:migrate
 */
import pool from "./pool.js";

const UP = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  full_name     VARCHAR(200) NOT NULL,
  email         VARCHAR(300) NOT NULL UNIQUE,
  password_hash VARCHAR(200) NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Scholarships table
CREATE TABLE IF NOT EXISTS scholarships (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(300) NOT NULL,
  provider      VARCHAR(300) NOT NULL,
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency      VARCHAR(10) NOT NULL DEFAULT 'INR',
  deadline      DATE,
  type          VARCHAR(30) NOT NULL DEFAULT 'government'
                  CHECK (type IN ('government','private','international','university')),
  category      VARCHAR(20)
                  CHECK (category IN ('general','obc','sc','st','ews')),
  education_level VARCHAR(30)
                  CHECK (education_level IN ('10th','12th','undergraduate','postgraduate','phd')),
  stream        VARCHAR(100),
  state         VARCHAR(100),
  country       VARCHAR(100) DEFAULT 'India',
  official_url  TEXT,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  documents_required TEXT[],
  eligibility_criteria TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_scholarships_type ON scholarships(type);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_featured ON scholarships(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_scholarships_education ON scholarships(education_level);
CREATE INDEX IF NOT EXISTS idx_scholarships_category ON scholarships(category);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_scholarships_search
  ON scholarships USING GIN (to_tsvector('english', coalesce(name,'') || ' ' || coalesce(provider,'') || ' ' || coalesce(description,'')));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_scholarships_updated ON scholarships;
CREATE TRIGGER trg_scholarships_updated
  BEFORE UPDATE ON scholarships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_users_updated ON users;
CREATE TRIGGER trg_users_updated
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

async function migrate() {
  console.log("🔄 Running migrations...");
  await pool.query(UP);
  console.log("✅ Migrations complete");
  await pool.end();
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
