import { apiRequest } from "./api";
import type { Contract } from "../types/contract";

export async function getContracts() {
  return apiRequest<Contract[]>("/contracts");
}

export async function getContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}`);
}

export async function createContract(data: unknown) {
  return apiRequest<Contract>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContract(
  id: string,
  data: unknown
) {
  return apiRequest<Contract>(`/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}