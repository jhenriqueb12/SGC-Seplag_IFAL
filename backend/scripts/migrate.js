// Aplica as migrações pendentes de database/migrations, em ordem alfabética.
// Cada arquivo é executado uma única vez e registrado na tabela schema_migrations.
// Uso (a partir da pasta backend/): npm run migrate
import "dotenv/config";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../src/config/database.js";

const databaseDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../database",
);
const migrationsDir = path.join(databaseDir, "migrations");

// Número arbitrário que impede duas execuções simultâneas do runner.
const LOCK_ID = 727274;

const checksum = (sql) => createHash("sha256").update(sql).digest("hex");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Banco vazio (ex.: PostgreSQL fora do Docker): cria o esquema inicial.
    const { rows: base } = await client.query(
      "SELECT to_regclass('public.users') AS users",
    );
    if (!base[0].users) {
      console.log("Banco vazio: aplicando schema.sql...");
      await client.query(await readFile(path.join(databaseDir, "schema.sql"), "utf8"));
    }

    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    const { rows } = await client.query(
      "SELECT filename, checksum FROM schema_migrations",
    );
    const applied = new Map(rows.map((row) => [row.filename, row.checksum]));

    let count = 0;
    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      const hash = checksum(sql);

      if (applied.has(file)) {
        if (applied.get(file) !== hash) {
          console.warn(
            `Aviso: ${file} foi alterada depois de aplicada. Crie uma nova migração em vez de editar uma antiga.`,
          );
        }
        continue;
      }

      console.log(`Aplicando ${file}...`);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
          [file, hash],
        );
        await client.query("COMMIT");
        count += 1;
      } catch (error) {
        await client.query("ROLLBACK");
        throw new Error(`Falha na migração ${file}: ${error.message}`);
      }
    }

    console.log(
      count ? `${count} migração(ões) aplicada(s).` : "Banco já está atualizado.",
    );
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
    client.release();
  }
}

try {
  await run();
} catch (error) {
  console.error(error.message || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
