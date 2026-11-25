import { apiRequest, setAccessToken } from "./api";
import type { Session } from "../types/contract";

type LoginResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    sector: string;
    role: string;
  };
};

export async function loginRequest(
  email: string,
  password: string,
  sector: string
) {
  const response = await apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, sector }),
  });

  setAccessToken(response.token);

  const session: Session = {
    email: response.user.email,
    sector: response.user.sector,
  };

  return { session, token: response.token };
}

export function logoutRequest() {
  setAccessToken(null);
}