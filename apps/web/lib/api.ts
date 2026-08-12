const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function resolveApiUrl(): string {
  if (API_URL) return API_URL.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') throw new Error('NEXT_PUBLIC_API_URL wajib dikonfigurasi untuk production');
  return 'http://localhost:3000/api/v1';
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !SUPABASE_URL || !SUPABASE_KEY) return null;
  const refreshToken = sessionStorage.getItem('bt_refresh_token');
  if (!refreshToken) return null;
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    sessionStorage.removeItem('bt_access_token');
    sessionStorage.removeItem('bt_refresh_token');
    localStorage.removeItem('bt_staff_identity');
    return null;
  }
  const session = await response.json() as { access_token?: string; refresh_token?: string };
  if (!session.access_token) return null;
  sessionStorage.setItem('bt_access_token', session.access_token);
  if (session.refresh_token) sessionStorage.setItem('bt_refresh_token', session.refresh_token);
  return session.access_token;
}

async function request<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('bt_access_token');
    if (token) headers.set('authorization', `Bearer ${token}`);
  }
  if (process.env.NODE_ENV !== 'production') {
    const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID;
    const userId = process.env.NEXT_PUBLIC_DEV_USER_ID;
    if (tenantId) headers.set('x-tenant-id', tenantId);
    if (userId) headers.set('x-dev-user-id', userId);
  }

  const response = await fetch(`${resolveApiUrl()}${path}`, { ...init, headers, cache: 'no-store' });
  if (response.status === 401 && retry && typeof window !== 'undefined') {
    const token = await refreshAccessToken();
    if (token) return request<T>(path, init, false);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const requestId = response.headers.get('x-request-id');
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(`${message ?? `API error ${response.status}`}${requestId ? ` (request: ${requestId})` : ''}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function apiGet<T>(path: string): Promise<T> { return request<T>(path, { method: 'GET' }); }
export async function apiPost<T>(path: string, body: unknown, headers?: HeadersInit): Promise<T> { return request<T>(path, { method: 'POST', headers: { 'content-type': 'application/json', ...Object.fromEntries(new Headers(headers).entries()) }, body: JSON.stringify(body) }); }
export async function apiPatch<T>(path: string, body: unknown): Promise<T> { return request<T>(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
export async function apiDelete<T>(path: string): Promise<T> { return request<T>(path, { method: 'DELETE' }); }
export async function apiUpload<T>(path: string, body: FormData): Promise<T> { return request<T>(path, { method: 'POST', body }); }
