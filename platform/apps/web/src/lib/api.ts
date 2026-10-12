/** Client HTTP : jeton d'accès en mémoire, refresh token en cookie httpOnly (rotation automatique). */

let accessToken: string | null = null;
let refreshing: Promise<boolean> | null = null;
let onSessionExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}
export function setSessionExpiredHandler(fn: () => void) {
  onSessionExpired = fn;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch("/api/auth/refresh", { method: "POST", credentials: "include", headers: { "x-forlife-csrf": "1" } })
    .then(async (r) => {
      if (!r.ok) return false;
      const body = (await r.json()) as { accessToken: string };
      accessToken = body.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request<T>(method: string, path: string, body?: unknown, extraHeaders: Record<string, string> = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { "x-forlife-csrf": "1", ...extraHeaders };
  if (accessToken) headers.authorization = `Bearer ${accessToken}`;
  let payload: BodyInit | undefined;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload, credentials: "include" });
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refreshSession()) return request<T>(method, path, body, extraHeaders, false);
    onSessionExpired?.();
  }
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: { code: string; message: string; details?: unknown } } | null;
    throw new ApiError(res.status, err?.error?.code ?? "HTTP_ERROR", err?.error?.message ?? `Erreur ${res.status}`, err?.error?.details);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) => request<T>("POST", path, body ?? {}, headers),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
  upload: <T>(path: string, form: FormData) => request<T>("POST", path, form),
};

/** URL d'un fichier protégé : chargé via fetch authentifié puis exposé en blob URL. */
export async function fetchBlobUrl(path: string): Promise<string> {
  const res = await fetch(`/api${path}`, { headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {} });
  if (!res.ok) throw new ApiError(res.status, "HTTP_ERROR", "Fichier indisponible");
  return URL.createObjectURL(await res.blob());
}
