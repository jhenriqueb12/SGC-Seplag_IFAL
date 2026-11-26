import { Router } from "express";
import { pool } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

// Apenas usuários ativos podem ser atribuídos como gestor ou fiscal.
router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, sector
             FROM users
             WHERE active = TRUE
             ORDER BY name ASC`,
    );
    res.json(rows.map((user) => ({ ...user, id: String(user.id) })));
  } catch (error) {
    next(error);
  }
});

export default router;
