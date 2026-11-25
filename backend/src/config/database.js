import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === "production"
    ? { ssl: { rejectUnauthorized: false } }
    : {}),
});

pool.on("error", (error) => {
  console.error("Erro inesperado no pool do PostgreSQL:", error);
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
