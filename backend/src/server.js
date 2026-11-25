import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
}));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    return res.json({ status: "ok", service: "sgc-seplag-api", database: "connected" });
  } catch {
    return res.status(503).json({
      status: "error",
      service: "sgc-seplag-api",
      database: "unavailable",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada." });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const server = app.listen(port, () => {
  console.log(`SGC API disponível em http://localhost:${port}`);
});

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
