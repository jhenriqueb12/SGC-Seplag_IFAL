import * as contractService from "../services/contractService.js";

const requiredFields = [
  "company_name",
  "process_number",
  "procurement_type",
  "object",
  "start_date",
  "end_date",
  "global_value",
  "organizational_unit",
];

function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === value;
}

function validateContract(body = {}) {
  const missing = requiredFields.filter(
    (field) => body[field] === undefined
      || body[field] === null
      || body[field] === "",
  );

  if (missing.length) {
    return `Campos obrigatórios: ${missing.join(", ")}.`;
  }

  if (!isValidDate(body.start_date) || !isValidDate(body.end_date)) {
    return "Informe datas válidas no formato YYYY-MM-DD.";
  }

  if (body.end_date <= body.start_date) {
    return "A data final deve ser posterior à data inicial.";
  }

  const amount = Number(body.global_value);
  if (!Number.isFinite(amount) || amount < 0) {
    return "O valor global deve ser um número maior ou igual a zero.";
  }

  return null;
}

function handleDatabaseError(error, res) {
  if (error.code === "23505") {
    return res.status(409).json({
      error: "Já existe um contrato com esse número de processo.",
    });
  }

  if (["23503", "23514", "22P02"].includes(error.code)) {
    return res.status(400).json({
      error: "Os dados informados violam uma regra do banco de dados.",
    });
  }

  return null;
}

export async function list(req, res, next) {
  try {
    res.json(await contractService.listContracts());
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const contract = await contractService.getContractById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: "Contrato não encontrado." });
    }
    return res.json(contract);
  } catch (error) {
    return next(error);
  }
}

export async function create(req, res, next) {
  const validationError = validateContract(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const contract = await contractService.createContract(req.body, req.user?.id);
    return res.status(201).json(contract);
  } catch (error) {
    return handleDatabaseError(error, res) ?? next(error);
  }
}

export async function update(req, res, next) {
  const validationError = validateContract(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const contract = await contractService.updateContract(
      req.params.id,
      req.body,
      req.user?.id,
    );

    if (!contract) {
      return res.status(404).json({ error: "Contrato não encontrado." });
    }
    return res.json(contract);
  } catch (error) {
    return handleDatabaseError(error, res) ?? next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await contractService.deleteContract(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Contrato não encontrado." });
    }
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
