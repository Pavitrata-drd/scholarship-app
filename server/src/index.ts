import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import scholarshipRoutes from "./routes/scholarships.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
