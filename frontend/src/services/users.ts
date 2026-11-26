import { apiRequest } from "./api";

export type ResponsibleUser = {
  id: string;
  name: string;
  email: string;
  sector: string;
};

export function getUsers() {
  return apiRequest<ResponsibleUser[]>("/users");
}
