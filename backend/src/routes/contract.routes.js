
import { Router } from "express";
import { pool } from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.use(authenticateToken);

function mapContract(row) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const end = new Date(`${row.end_date.toISOString().slice(0, 10)}T00:00:00Z`);
  const daysRemaining = Math.ceil((end - today) / 86400000);

  let status;

  if (daysRemaining < 0) status = "Vencido";
  else if (daysRemaining <= 30) status = "A renovar";
  else status = "Vigente";

  return {
    id: String(row.id),
    title: row.company_name,
    process: row.process_number,
    modality: row.procurement_type,
    description: row.object,
    startsAt: row.start_date.toISOString().slice(0, 10),
    endsAt: row.end_date.toISOString().slice(0, 10),
    amount: Number(row.global_value),
    unit: row.organizational_unit,
    managerId: row.manager_id ? String(row.manager_id) : null,
    managerName: row.manager_name ?? null,
    managerEmail: row.manager_email ?? null,
    inspectorId: row.inspector_id ? String(row.inspector_id) : null,
    inspectorName: row.inspector_name ?? null,
    inspectorEmail: row.inspector_email ?? null,
    status,
    daysRemaining: Math.max(daysRemaining, 0),
    updatedAt: row.updated_at,
  };
}

function validateContract(data) {
  const required = [
    "title",
    "process",
    "modality",
    "description",
    "startsAt",
    "endsAt",
    "amount",
    "unit",
    "managerId",
    "inspectorId",
  ];

  for (const field of required) {
    if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
    ) {
      return `O campo ${field} é obrigatório.`;
    }
  }

  if (!Number.isFinite(Number(data.amount)) || Number(data.amount) < 0) {
    return "O valor global deve ser um número maior ou igual a zero.";
  }

  if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.startsAt) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(data.endsAt) ||
      data.endsAt <= data.startsAt
  ) {
    return "A data final deve ser posterior à data inicial.";
  }

  return null;
}

async function validateResponsibleUsers(client, managerId, inspectorId) {
  const result = await client.query(
      `SELECT id
     FROM users
     WHERE active = TRUE
       AND id IN ($1, $2)`,
      [managerId, inspectorId],
  );

  const validIds = new Set(result.rows.map((row) => String(row.id)));

  return (
      validIds.has(String(managerId)) &&
      validIds.has(String(inspectorId))
  );
}

const selectContract = `
  SELECT
    c.id,
    c.company_name,
    c.process_number,
    c.procurement_type,
    c.object,
    c.start_date,
    c.end_date,
    c.global_value,
    c.organizational_unit,
    c.manager_id,
    c.inspector_id,
    c.created_at,
    c.updated_at,
    manager.name AS manager_name,
    manager.email AS manager_email,
    inspector.name AS inspector_name,
    inspector.email AS inspector_email
  FROM contracts c
         LEFT JOIN users manager ON manager.id = c.manager_id
         LEFT JOIN users inspector ON inspector.id = c.inspector_id
`;

router.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
        `${selectContract} ORDER BY c.end_date ASC`,
    );

    res.json(result.rows.map(mapContract));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
        `${selectContract} WHERE c.id = $1`,
        [req.params.id],
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Contrato não encontrado." });
    }

    res.json(mapContract(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const validationError = validateContract(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const data = req.body;

    const validUsers = await validateResponsibleUsers(
        client,
        data.managerId,
        data.inspectorId,
    );

    if (!validUsers) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "O gestor e o fiscal devem ser usuários ativos cadastrados no sistema.",
      });
    }

    const result = await client.query(
        `INSERT INTO contracts (
        company_name,
        process_number,
        procurement_type,
        situation,
        object,
        start_date,
        end_date,
        global_value,
        organizational_unit,
        manager_id,
        inspector_id,
        created_by,
        updated_by
      )
      VALUES (
        $1, $2, $3, 'Calculada', $4, $5, $6, $7,
        $8, $9, $10, $11, $11
      )
      RETURNING *`,
        [
          data.title.trim(),
          data.process.trim(),
          data.modality,
          data.description.trim(),
          data.startsAt,
          data.endsAt,
          data.amount,
          data.unit,
          data.managerId,
          data.inspectorId,
          req.user.sub,
        ],
    );

    const contract = result.rows[0];

    await client.query(
        `INSERT INTO contract_audit_log
           (contract_id, user_id, field_name, old_value, new_value)
         VALUES ($1, $2, 'Cadastro', NULL, $3)`,
        [contract.id, req.user.sub, contract.process_number],
    );

    const completeResult = await client.query(
        `${selectContract} WHERE c.id = $1`,
        [contract.id],
    );

    await client.query("COMMIT");

    res.status(201).json(mapContract(completeResult.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Já existe um contrato com esse número de processo.",
      });
    }

    next(error);
  } finally {
    client.release();
  }
});

router.put("/:id", async (req, res, next) => {
  const validationError = validateContract(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const previousResult = await client.query(
        `SELECT *
       FROM contracts
       WHERE id = $1
       FOR UPDATE`,
        [req.params.id],
    );

    if (!previousResult.rowCount) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Contrato não encontrado." });
    }

    const old = previousResult.rows[0];
    const data = req.body;

    const validUsers = await validateResponsibleUsers(
        client,
        data.managerId,
        data.inspectorId,
    );

    if (!validUsers) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "O gestor e o fiscal devem ser usuários ativos cadastrados no sistema.",
      });
    }

    const values = [
      data.title.trim(),
      data.process.trim(),
      data.modality,
      data.description.trim(),
      data.startsAt,
      data.endsAt,
      data.amount,
      data.unit,
      data.managerId,
      data.inspectorId,
      req.user.sub,
      req.params.id,
    ];

    const result = await client.query(
        `UPDATE contracts SET
        company_name = $1,
        process_number = $2,
        procurement_type = $3,
        object = $4,
        start_date = $5,
        end_date = $6,
        global_value = $7,
        organizational_unit = $8,
        manager_id = $9,
        inspector_id = $10,
        updated_by = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
        values,
    );

    const updated = result.rows[0];

    const auditFields = [
      ["Empresa contratada", old.company_name, updated.company_name],
      ["Número do processo", old.process_number, updated.process_number],
      ["Modalidade", old.procurement_type, updated.procurement_type],
      ["Objeto", old.object, updated.object],
      ["Data de início", old.start_date, updated.start_date],
      ["Data de encerramento", old.end_date, updated.end_date],
      ["Valor global", old.global_value, updated.global_value],
      ["Unidade responsável", old.organizational_unit, updated.organizational_unit],
      ["Gestor do contrato", old.manager_id, updated.manager_id],
      ["Fiscal do contrato", old.inspector_id, updated.inspector_id],
    ];

    for (const [field, before, after] of auditFields) {
      if (String(before) !== String(after)) {
        await client.query(
            `INSERT INTO contract_audit_log
               (contract_id, user_id, field_name, old_value, new_value)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              updated.id,
              req.user.sub,
              field,
              String(before),
              String(after),
            ],
        );
      }
    }

    const completeResult = await client.query(
        `${selectContract} WHERE c.id = $1`,
        [updated.id],
    );

    await client.query("COMMIT");

    res.json(mapContract(completeResult.rows[0]));
  } catch (error) {
    await client.query("ROLLBACK");

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Já existe um contrato com esse número de processo.",
      });
    }

    next(error);
  } finally {
    client.release();
  }
});

router.get("/:id/history", async (req, res, next) => {
  try {
    const result = await pool.query(
        `SELECT
           a.id,
           a.contract_id,
           a.changed_at,
           a.field_name,
           a.old_value,
           a.new_value,
           u.name,
           u.email
         FROM contract_audit_log a
                LEFT JOIN users u ON u.id = a.user_id
         WHERE a.contract_id = $1
         ORDER BY a.changed_at DESC`,
        [req.params.id],
    );

    res.json(
        result.rows.map((row) => ({
          id: String(row.id),
          contractId: String(row.contract_id),
          timestamp: row.changed_at,
          field: row.field_name,
          previousValue: row.old_value,
          currentValue: row.new_value,
          name: row.name ?? "Usuário não identificado",
          email: row.email,
        })),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
