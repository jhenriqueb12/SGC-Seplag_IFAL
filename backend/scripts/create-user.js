import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../src/config/database.js";

const [name, email, sector, password] = process.argv.slice(2);

if (!name || !email || !sector || !password) {
  console.error(
    'Uso: npm run create-user -- "Nome" email setor senha'
  );
  process.exit(1);
}

try {
  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO users (name, email, sector, password_hash)
     VALUES ($1, $2, $3, $4)`,
    [name, email, sector, hash]
  );

  console.log("Usuário criado com sucesso.");
} catch (error) {
  console.error("Não foi possível criar o usuário:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}