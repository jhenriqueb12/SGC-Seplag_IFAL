ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS manager_id BIGINT REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS inspector_id BIGINT REFERENCES users(id);

CREATE INDEX IF NOT EXISTS idx_contracts_manager
    ON contracts (manager_id);

CREATE INDEX IF NOT EXISTS idx_contracts_inspector
    ON contracts (inspector_id);

CREATE TABLE IF NOT EXISTS contract_notifications (
                                                      id BIGSERIAL PRIMARY KEY,
                                                      contract_id BIGINT NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id),
    months_before SMALLINT NOT NULL
    CHECK (months_before IN (5, 4, 3)),
    recipient_email VARCHAR(180) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'sent', 'failed')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (contract_id, months_before, recipient_email)
    );