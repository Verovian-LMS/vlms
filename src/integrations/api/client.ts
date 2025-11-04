// Minimal API client for FastAPI backend
// Reads base URL from Vite env, falls back to localhost:8001

export const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8001';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem('access_token', token);
    else localStorage.removeItem('access_token');
  } catch {
    // ignore storage errors
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const resp = await fetch(url, { ...options, headers });
  const isJson = resp.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await resp.json() : (await resp.text() as unknown);

  if (!resp.ok) {
    const msg = (body as any)?.detail || (body as any)?.message || resp.statusText;
    throw new Error(typeof msg === 'string' ? msg : 'Request failed');
  }
  return body as T;
}

// Auth endpoints
export type LoginRequest = { email: string; password: string };
export type TokenResponse = { access_token: string; token_type: string };
export type RegisterRequest = { name: string; email: string; password: string };

export async function apiLogin(req: LoginRequest): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function apiRegister(req: RegisterRequest): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export type ProfileResponse = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  avatar?: string | null;
  specialty?: string | null;
  bio?: string | null;
};

export async function apiMe(): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>('/api/v1/auth/me', { method: 'GET', auth: true });
}




