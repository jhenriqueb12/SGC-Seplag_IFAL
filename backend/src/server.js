import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import contractRoutes from "./routes/contract.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { startContractNotificationJob } from "./jobs/contractNotificationJob.js";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({
  origin: (process.env.CORS_ORIGIN || "http://localhost:8081")
      .split(",")
      .map((origin) => origin.trim()),
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch {
    res.status(503).json({
      status: "error",
      database: "unavailable",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/users", usersRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Erro interno do servidor.",
  });
});

app.listen(port, () => {
  console.log(`SGC API disponível em http://localhost:${port}`);
  startContractNotificationJob();
});
