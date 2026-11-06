-- Esquema inicial do SGC. Execute em um banco vazio.
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  sector VARCHAR(120) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'viewer',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contracts (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  process_number VARCHAR(100) NOT NULL UNIQUE,
  procurement_type VARCHAR(120) NOT NULL,
  situation VARCHAR(120) NOT NULL,
  object TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  global_value NUMERIC(15, 2) NOT NULL CHECK (global_value >= 0),
  organizational_unit VARCHAR(160) NOT NULL,
  created_by BIGINT REFERENCES users(id),
  updated_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_contracts_company ON contracts (company_name);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts (end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON contracts (organizational_unit);

CREATE TABLE IF NOT EXISTS contract_audit_log (
  id BIGSERIAL PRIMARY KEY,
  contract_id BIGINT NOT NULL REFERENCES contracts(id),
  user_id BIGINT REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_contract_date ON contract_audit_log (contract_id, changed_at DESC);
