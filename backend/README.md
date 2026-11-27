# Backend — SGC

API REST em Node.js + Express, com PostgreSQL.

## Executar

```bash
cp .env.example .env
npm install
npm run dev
```

Health check: `GET http://localhost:3000/api/health`.

## Banco de dados

O esquema inicial está em `../database/schema.sql`. Para bancos existentes, aplique as migrações em `../database/migrations/` na ordem indicada.

## Responsáveis e notificações

`GET /api/users` retorna usuários ativos para seleção como gestor e fiscal. O cadastro e a edição de contratos exigem `managerId` e `inspectorId`, ambos IDs de usuários ativos.

O job de notificações é ativado com `NOTIFICATIONS_ENABLED=true`. Ele executa diariamente no horário definido por `NOTIFICATIONS_CRON` (padrão `0 8 * * *`) e fuso `NOTIFICATIONS_TIMEZONE` (padrão `America/Maceio`). Os marcos são 5, 4 e 3 meses antes do encerramento. Configure o SMTP institucional em `backend/.env`.

Para desenvolvimento, use Mailpit com `docker compose --profile dev up -d` na raiz do projeto. Interface web: `http://localhost:8025`; SMTP: `localhost:1025`.

Não coloque credenciais reais no repositório.
