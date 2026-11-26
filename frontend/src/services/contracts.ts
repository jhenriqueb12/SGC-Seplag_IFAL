import { apiRequest } from "./api";
import type { Contract } from "../types/contract";

export function getContracts() {
  return apiRequest<Contract[]>("/contracts");
}

export function getContract(id: string) {
  return apiRequest<Contract>(`/contracts/${id}`);
}

export function createContract(data: unknown) {
  return apiRequest<Contract>("/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateContract(id: string, data: unknown) {
  return apiRequest<Contract>(`/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getContractHistory(id: string) {
  return apiRequest(`/contracts/${id}/history`);
}
