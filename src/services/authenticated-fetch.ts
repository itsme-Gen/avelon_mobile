import { API_BASE_URL } from "@/config";
import {
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/utils/storage";

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;

    const payload = await response.json();
    const accessToken = payload?.data?.accessToken as string | undefined;
    if (!accessToken) return null;

    await saveTokens(accessToken, refreshToken);
    return accessToken;
  } catch {
    return null;
  }
}

function withBearer(options: RequestInit, token: string | null): RequestInit {
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...options, headers };
}

/**
 * Authenticated fetch with a single, shared refresh attempt on 401. Parallel
 * requests wait on the same refresh instead of rotating tokens repeatedly.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  options: RequestInit = {},
): Promise<Response> {
  const initialToken = await getAccessToken();
  const response = await fetch(input, withBearer(options, initialToken));
  if (response.status !== 401) return response;

  refreshInFlight ??= refreshAccessToken().finally(() => {
    refreshInFlight = null;
  });
  const freshToken = await refreshInFlight;
  if (!freshToken) {
    await clearAuthData();
    return response;
  }

  return fetch(input, withBearer(options, freshToken));
}
