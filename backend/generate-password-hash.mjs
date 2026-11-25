import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const password = await rl.question('Digite a senha de teste: ');
rl.close();

if (!password) {
  console.error('A senha não pode ser vazia.');
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');

console.log('\nHash para cadastrar no banco:');
console.log(`${salt}:${hash}`);