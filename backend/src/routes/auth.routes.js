import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, sector } = req.body;

    if (!email || !password || !sector) {
      return res.status(400).json({
        error: "Informe e-mail, senha e setor.",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, sector, role
       FROM users
       WHERE LOWER(email) = LOWER($1)
         AND active = TRUE`,
      [email.trim()],
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({
        error: "E-mail ou senha inválidos.",
      });
    }

    if (user.sector !== sector) {
      return res.status(403).json({
        error: "O setor selecionado não corresponde ao usuário.",
      });
    }

    const token = jwt.sign(
      {
        sub: String(user.id),
        role: user.role,
        sector: user.sector,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" },
    );

    return res.json({
      token,
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        sector: user.sector,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
