-- Índice presente em schema.sql, mas ausente da migração 002.
CREATE INDEX IF NOT EXISTS idx_contract_notifications_status
    ON contract_notifications (status, updated_at);
