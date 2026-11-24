import { query } from "../config/database.js";

const fields = [
  "company_name",
  "process_number",
  "procurement_type",
  "object",
  "start_date",
  "end_date",
  "global_value",
  "organizational_unit",
];

export function calculateSituation(startDate, endDate, today = new Date()) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const current = new Date(Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ));

  if (current < start) return "A iniciar";
  if (current > end) return "Encerrado";
  return "Vigente";
}

function getValues(payload) {
  return fields.map((field) => payload[field]);
}

export async function listContracts() {
  const { rows } = await query(
    "SELECT * FROM contracts ORDER BY end_date ASC, id DESC",
  );
  return rows;
}

export async function getContractById(id) {
  const { rows } = await query(
    "SELECT * FROM contracts WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function createContract(payload, userId) {
  const situation = calculateSituation(payload.start_date, payload.end_date);
  const columns = [...fields, "situation", "created_by", "updated_by"];
  const placeholders = columns.map((_, index) => `$${index + 1}`);
  const values = [...getValues(payload), situation, userId ?? null, userId ?? null];

  const { rows } = await query(
    `INSERT INTO contracts (${columns.join(", ")})
     VALUES (${placeholders.join(", ")})
     RETURNING *`,
    values,
  );
  return rows[0];
}

export async function updateContract(id, payload, userId) {
  const situation = calculateSituation(payload.start_date, payload.end_date);
  const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = [...getValues(payload), situation, userId ?? null, id];

  const { rows } = await query(
    `UPDATE contracts
     SET ${assignments.join(", ")},
         situation = $9,
         updated_by = $10,
         updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function deleteContract(id) {
  const { rowCount } = await query(
    "DELETE FROM contracts WHERE id = $1",
    [id],
  );
  return rowCount > 0;
}
