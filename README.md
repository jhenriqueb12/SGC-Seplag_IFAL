# SGC — Sistema de Gestão de Contratos

Sistema web para centralizar o cadastro, a consulta e o acompanhamento de contratos da Superintendência Administrativa (SAD/SEPLAG).

## Objetivo do MVP

Entregar uma versão simples e executável, priorizando:
- Autenticação básica de usuários.
- Cadastro, edição, listagem e consulta de contratos.
- Busca e filtros.
- Cálculo automático da situação do contrato a partir das datas.
- Base preparada para histórico de alterações e alertas.

## Arquitetura inicial

- **Frontend:** React + Vite.
- **Backend:** Node.js + Express.
- **Banco de dados:** PostgreSQL.
- **Execução local:** Docker Compose para o PostgreSQL (opcional); frontend e backend executados por npm.

Esta é uma arquitetura inicial de MVP. Não inclui Kubernetes, microsserviços ou serviços em nuvem.

## Estrutura

```
frontend/       Aplicação React
backend/        API REST Express
database/       Esquema SQL e dados de desenvolvimento
docs/           Decisões e documentação do projeto
```

## Pré-requisitos

- Node.js 20 ou superior
- npm
- PostgreSQL 15 ou superior (ou Docker para executar apenas o banco)

## Configuração

### 1. Banco de dados

Crie um banco PostgreSQL e execute:

```bash
psql -U postgres -d sgc_seplag -f database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

A API ficará disponível em `http://localhost:3000`. Verificação: `GET /api/health`.

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Variáveis de ambiente

Consulte `backend/.env.example`. Nunca versione credenciais reais ou arquivos `.env`.

## Regras iniciais de contrato

- O número do processo deve ser único.
- A data de encerramento deve ser posterior à data de início.
- Situação deve ser calculada com base nas datas, sem depender de preenchimento manual.
- Campos e regras adicionais devem ser validados na API.

## Desenvolvimento

- Commits pequenos e objetivos.
- Toda alteração de banco deve ser documentada em `database/`.
- Não incluir dados reais/sigilosos de contratos no repositório.
- Registrar decisões relevantes em `docs/`.

## Status

Estrutura inicial do repositório. Funcionalidades serão implementadas incrementalmente conforme o backlog do MVP.
