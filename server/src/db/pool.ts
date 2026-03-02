import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connectivity on first import
pool.query("SELECT NOW()").then(() => {
  console.log("✅ PostgreSQL connected");
}).catch((err) => {
  console.error("❌ PostgreSQL connection failed:", err.message);
});

export default pool;
