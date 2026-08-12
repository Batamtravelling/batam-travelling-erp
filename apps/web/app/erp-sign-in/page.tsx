'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '../../lib/api';

type StaffProfile = {
  tenantId: string;
  userId: string;
  name: string;
  jobTitle?: string;
  permissions: string[];
  role: string;
};
type SupabaseSession = { access_token?: string; refresh_token?: string; expires_in?: number; error_description?: string; msg?: string };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export default function Page() {
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const landing = (permissions: string[]) => {
    if (permissions.includes('customer.read')) return '/crm/customers';
    if (permissions.includes('invoice.read') || permissions.includes('payment.read')) return '/finance/invoices';
    if (permissions.includes('trip.read') || permissions.includes('assignment.manage')) return '/operations/trips';
    if (permissions.includes('task.read') || permissions.includes('task.manage')) return '/tasks';
    return '/dashboard';
  };

  const go = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('');
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setMsg('Supabase Auth belum dikonfigurasi pada website.');
      return;
    }
    const f = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: SUPABASE_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ email: f.get('email'), password: f.get('password') }),
      });
      const session = await response.json() as SupabaseSession;
      if (!response.ok || !session.access_token) throw new Error(session.error_description || session.msg || 'Email atau password tidak valid');

      sessionStorage.setItem('bt_access_token', session.access_token);
      if (session.refresh_token) sessionStorage.setItem('bt_refresh_token', session.refresh_token);
      const profile = await apiGet<StaffProfile>('/auth/me');
      localStorage.setItem('bt_staff_identity', JSON.stringify(profile));
      router.replace(landing(profile.permissions));
    } catch (error) {
      sessionStorage.removeItem('bt_access_token');
      sessionStorage.removeItem('bt_refresh_token');
      setMsg(error instanceof Error ? error.message : 'Gagal masuk');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="hub">
      <form className="hubForm" onSubmit={go}>
        <span className="hubTag">Akses Internal Aman</span>
        <h1>Masuk ke ERP Staff</h1>
        <p>Gunakan email karyawan terverifikasi dan password Supabase Anda.</p>
        {msg && <div className="hubAlert hubError" role="alert">{msg}</div>}
        <label>Email Staff<input name="email" type="email" autoComplete="username" required /></label>
        <label>Password<input name="password" type="password" autoComplete="current-password" minLength={8} required /></label>
        <button className="hubBtn blue" disabled={busy}>{busy ? 'Memverifikasi...' : 'Masuk ERP'}</button>
        <div className="hubAuthLinks">Akses pelanggan tetap melalui <Link href="/my-trip">Dashboard Perjalanan</Link></div>
      </form>
    </main>
  );
}
