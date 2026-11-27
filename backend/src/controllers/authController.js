import {
  createHmac,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { query } from "../config/database.js";

const scrypt = promisify(scryptCallback);

async function verifyPassword(password, storedHash) {
  // Formato esperado no banco: salt:hash (scrypt).
  const [salt, hash] = (storedHash ?? "").split(":");
  if (!salt || !hash) return false;

  const derived = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(hash, "hex");

  return (
    derived.length === expected.length && timingSafeEqual(derived, expected)
  );
}

function createToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET não foi configurado.");

  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 8 * 60 * 60,
    }),
  ).toString("base64url");

  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({
        error: "E-mail e senha são obrigatórios.",
      });
    }

    const { rows } = await query(
      `SELECT id, name, email, password_hash, role, active
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email],
    );

    const user = rows[0];
    if (
      !user ||
      !user.active ||
      !(await verifyPassword(password, user.password_hash))
    ) {
      return res.status(401).json({ error: "E-mail ou senha inválidos." });
    }

    const token = createToken(user);
    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
}
