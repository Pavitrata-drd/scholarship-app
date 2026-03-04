import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { execSync } from "child_process";
import net from "net";
import scholarshipRoutes from "./routes/scholarships.js";
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import savedRoutes from "./routes/saved.js";
import applicationRoutes from "./routes/applications.js";
import documentRoutes from "./routes/documents.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ── Auto-free port (fixes "EADDRINUSE" on tsx watch restarts) ──
async function freePort(port: number): Promise<void> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once("error", () => {
        // Port is in use — try to kill the holder (Windows)
        try {
          const out = execSync(
            `netstat -ano | findstr ":${port}" | findstr "LISTEN"`,
            { encoding: "utf8", timeout: 3000 }
          );
          const pids = new Set(
            out.split("\n")
              .map((l) => l.trim().split(/\s+/).pop())
              .filter((p): p is string => !!p && /^\d+$/.test(p) && p !== String(process.pid))
          );
          for (const pid of pids) {
            try { execSync(`taskkill /PID ${pid} /F`, { timeout: 3000 }); } catch { /* already dead */ }
          }
          console.log(`♻️  Killed stale process(es) on port ${port}`);
          // Give the OS a moment to release the socket
          setTimeout(resolve, 500);
        } catch {
          resolve(); // nothing found or not on Windows — let it fail naturally
        }
      })
      .once("listening", () => {
        tester.close(() => resolve()); // port is free
      })
      .listen(port);
  });
}


// ── Middleware ──────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In development, allow any localhost port
      if (origin.match(/^http:\/\/localhost:\d+$/)) {
        return callback(null, true);
      }
      // In production, restrict to CLIENT_URL
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 catch-all ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start ──────────────────────────────────────────────────────
let server: ReturnType<typeof app.listen>;

async function start() {
  await freePort(PORT);

  server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is still in use after cleanup. Change PORT in .env`);
      process.exit(1);
    }
    throw err;
  });
}

start();

// Graceful shutdown — release the port when the process is killed
const shutdown = () => { if (server) server.close(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown);
process.on("exit",    () => { if (server) server.close(); });

export default app;
