import 'dotenv/config';
import crypto from 'node:crypto';
import pg from 'pg';

const [name, email, sector, password] = process.argv.slice(2);

if (!name || !email || !sector || !password) {
  console.error('Uso: npm run create-user -- "Nome" "email" "Setor" "Senha"');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  // Gera hash SHA-256 (mude para `password` puro se o seu login não usar hash)
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

  const result = await pool.query(
    `INSERT INTO users (name, email, sector, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, sector`,
    [name, email, sector, passwordHash]
  );

  console.log('Usuário criado com sucesso:', result.rows[0]);
} catch (error) {
  console.error('Erro ao criar usuário:', error.message);
} finally {
  await pool.end();
}
