export type PublicApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: 'not-found' | 'configuration' | 'upstream'; status?: number; requestId?: string };

import { demoForPath, publicDemoEnabled } from './public-demo-data';

function apiOrigin(): string | null {
  const configured = process.env.SERVER_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (configured) return configured.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production' ? null : 'http://localhost:3000/api/v1';
}

export async function publicApiGet<T>(path: string): Promise<PublicApiResult<T>> {
  if (publicDemoEnabled) {
    const demo = demoForPath(path);
    return demo === undefined ? { ok: false, kind: 'not-found', status: 404 } : { ok: true, data: demo as T };
  }
  const origin = apiOrigin();
  if (!origin) return { ok: false, kind: 'configuration' };
  try {
    const response = await fetch(`${origin}${path}`, { next: { revalidate: 120 }, signal: AbortSignal.timeout(8000) });
    const requestId = response.headers.get('x-request-id') ?? undefined;
    if (response.status === 404) return { ok: false, kind: 'not-found', status: 404, requestId };
    if (!response.ok) return { ok: false, kind: 'upstream', status: response.status, requestId };
    return { ok: true, data: await response.json() as T };
  } catch {
    return { ok: false, kind: 'upstream' };
  }
}

export function publicApiErrorMessage(result: Exclude<PublicApiResult<unknown>, { ok: true }>) {
  if (result.kind === 'configuration') return 'Konfigurasi layanan publik belum lengkap.';
  return `Informasi belum dapat dimuat karena layanan sedang terganggu${result.status ? ` (HTTP ${result.status})` : ''}${result.requestId ? ` · Referensi ${result.requestId}` : ''}.`;
}
