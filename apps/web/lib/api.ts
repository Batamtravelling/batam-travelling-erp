const API_URL = process.env.NEXT_PUBLIC_API_URL;

function resolveApiUrl(): string {
  if (API_URL) return API_URL.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL wajib dikonfigurasi untuk production');
  }
  return 'http://localhost:3000/api/v1';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (typeof window !== 'undefined') {
    const token = window.sessionStorage.getItem('bt_access_token');
    if (token) headers.set('authorization', `Bearer ${token}`);
  }
  if (process.env.NODE_ENV !== 'production') {
    const tenantId = process.env.NEXT_PUBLIC_DEV_TENANT_ID;
    const userId = process.env.NEXT_PUBLIC_DEV_USER_ID;
    if (tenantId) headers.set('x-tenant-id', tenantId);
    if (userId) headers.set('x-dev-user-id', userId);
  }

  const response = await fetch(`${resolveApiUrl()}${path}`, { ...init, headers, cache: 'no-store' });
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
export async function apiPost<T>(path: string, body: unknown): Promise<T> { return request<T>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
export async function apiPatch<T>(path: string, body: unknown): Promise<T> { return request<T>(path, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); }
export async function apiDelete<T>(path: string): Promise<T> { return request<T>(path, { method: 'DELETE' }); }
