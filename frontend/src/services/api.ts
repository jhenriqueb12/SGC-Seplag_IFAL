const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

let token: string | null = null;

export function setAccessToken(value: string | null) {
  token = value;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = response.status === 204
    ? null
    : await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Erro ao comunicar com o servidor.");
  }

  return data as T;
}