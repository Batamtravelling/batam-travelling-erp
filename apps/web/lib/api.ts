const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'x-tenant-id': process.env.NEXT_PUBLIC_DEV_TENANT_ID ?? '', 'x-dev-user-id': process.env.NEXT_PUBLIC_DEV_USER_ID ?? '' }, cache: 'no-store' });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.message ?? `API error ${response.status}`); }
  return response.json();
}
