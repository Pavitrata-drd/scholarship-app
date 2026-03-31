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
import { startDeadlineReminderJob } from "./jobs/deadlineReminders.js";

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
      const isDev = process.env.NODE_ENV !== "production";

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // In development, allow any localhost port
      if (isDev && origin.match(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/)) {
        return callback(null, true);
      }
      // In development, allow private LAN IP origins (for mobile device testing).
      if (isDev && origin.match(/^http:\/\/(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):\d+$/)) {
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

// Root route
app.get("/", (_req, res) => {
  res.type("text/html").send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ScholarHub API</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; border-radius: 8px; padding: 40px; max-width: 600px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        h1 { color: #667eea; margin-bottom: 10px; }
        .version { color: #999; font-size: 14px; margin-bottom: 20px; }
        .status { background: #4CAF50; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; margin-bottom: 20px; }
        h2 { font-size: 18px; color: #333; margin-top: 30px; margin-bottom: 15px; }
        .endpoint { background: #f5f5f5; padding: 12px; margin: 8px 0; border-left: 4px solid #667eea; font-family: 'Courier New', monospace; font-size: 14px; }
        .endpoint code { color: #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎓 ScholarHub API Server</h1>
        <p class="version">Version 1.0.0</p>
        <span class="status">✓ Running</span>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint"><code>/api/health</code> — Health check</div>
        <div class="endpoint"><code>/api/auth</code> — Authentication</div>
        <div class="endpoint"><code>/api/scholarships</code> — Scholarships</div>
        <div class="endpoint"><code>/api/profile</code> — User profile</div>
        <div class="endpoint"><code>/api/saved</code> — Saved scholarships</div>
        <div class="endpoint"><code>/api/applications</code> — Applications tracker</div>
        <div class="endpoint"><code>/api/documents</code> — Document vault</div>
        <div class="endpoint"><code>/api/notifications</code> — Notifications</div>
        <div class="endpoint"><code>/api/admin</code> — Admin dashboard</div>
      </div>
    </body>
    </html>
  `);
});

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
    // Start background jobs
    startDeadlineReminderJob();
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


