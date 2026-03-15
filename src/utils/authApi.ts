import type { AuthResponse, AuthUser } from "../types";
import { buildBackendUrl } from "./backendUrl";

type AuthPayload = {
  email: string;
  password: string;
  displayName?: string;
};

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "認証に失敗しました。";
  } catch {
    return "認証に失敗しました。";
  }
}

export async function registerUser(payload: AuthPayload): Promise<AuthResponse> {
  const response = await fetch(buildBackendUrl("/api/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AuthResponse;
}

export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  const response = await fetch(buildBackendUrl("/api/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as AuthResponse;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(buildBackendUrl("/api/auth/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as { user: AuthUser };
  return data.user;
}
