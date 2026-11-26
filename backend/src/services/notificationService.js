import nodemailer from "nodemailer";
import { pool } from "../config/database.js";

const milestones = [5, 4, 3];

function createTransport() {
    const required = ["SMTP_HOST", "SMTP_PORT"];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length) {
        throw new Error(`Configuração SMTP incompleta: ${missing.join(", ")}`);
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        ...(process.env.SMTP_USER && process.env.SMTP_PASSWORD
            ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }
            : {}),
    });
}

function formatDate(value) {
    return new Date(`${String(value).slice(0, 10)}T00:00:00Z`).toLocaleDateString(
        "pt-BR",
        { timeZone: "UTC" },
    );
}

function buildMessage(contract, monthsBefore) {
    const subject = `Alerta: contrato ${contract.process_number} encerra em ${monthsBefore} meses`;
    const text = [
        `Olá, ${contract.recipient_name}.`,
        "",
        `Este é um aviso de que o contrato ${contract.company_name} (processo ${contract.process_number}) está próximo do encerramento.`,
        `Data de encerramento: ${formatDate(contract.end_date)}.`,
        `Prazo do alerta: ${monthsBefore} meses.`,
        "",
        `Objeto: ${contract.object}`,
        "",
        "Esta é uma mensagem automática do Sistema de Gestão de Contratos.",
    ].join("\n");

    return { subject, text };
}

/**
 * Envia os alertas dos marcos de 5, 4 e 3 meses.
 * A tabela de notificações garante idempotência por contrato, marco e destinatário.
 */
export async function sendDueContractNotifications({ transport } = {}) {
    const mailer = transport ?? createTransport();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    let sent = 0;

    for (const monthsBefore of milestones) {
        const { rows: contracts } = await pool.query(
            `SELECT c.id, c.company_name, c.process_number, c.object, c.end_date,
              responsible.user_id, u.name AS recipient_name, u.email AS recipient_email
       FROM contracts c
       CROSS JOIN LATERAL (
         VALUES (c.manager_id), (c.inspector_id)
       ) AS responsible(user_id)
       JOIN users u ON u.id = responsible.user_id AND u.active = TRUE
       WHERE c.end_date - make_interval(months => $1) <= CURRENT_DATE
         AND c.end_date - make_interval(months => $1) >= CURRENT_DATE - INTERVAL '1 month'
       ORDER BY c.end_date ASC, c.id ASC`,
            [monthsBefore],
        );

        for (const contract of contracts) {
            // Reserva o envio antes de chamar o SMTP; falhas podem ser reprocessadas.
            const reservation = await pool.query(
                `INSERT INTO contract_notifications
           (contract_id, user_id, months_before, recipient_email, status)
         VALUES ($1, $2, $3, $4, 'processing')
         ON CONFLICT (contract_id, months_before, recipient_email)
         DO UPDATE SET status = 'processing', error_message = NULL, updated_at = NOW()
         WHERE contract_notifications.status = 'failed'
            OR (contract_notifications.status = 'processing' AND contract_notifications.updated_at < NOW() - INTERVAL '15 minutes')
         RETURNING id`,
                [contract.id, contract.user_id, monthsBefore, contract.recipient_email],
            );

            if (!reservation.rowCount) continue;

            try {
                const { subject, text } = buildMessage(contract, monthsBefore);
                await mailer.sendMail({
                    from,
                    to: contract.recipient_email,
                    subject,
                    text,
                });

                await pool.query(
                    `UPDATE contract_notifications
           SET status = 'sent', sent_at = NOW(), error_message = NULL, updated_at = NOW()
           WHERE id = $1`,
                    [reservation.rows[0].id],
                );
                sent += 1;
            } catch (error) {
                await pool.query(
                    `UPDATE contract_notifications
           SET status = 'failed', error_message = $2, updated_at = NOW()
           WHERE id = $1`,
                    [reservation.rows[0].id, String(error.message || error).slice(0, 2000)],
                );
                console.error(`Falha ao notificar ${contract.recipient_email}:`, error);
            }
        }
    }

    return sent;
}

export const notificationMilestones = milestones;
