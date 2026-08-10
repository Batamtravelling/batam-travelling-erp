'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '../../lib/api';

type StaffSigninResponse = {
  tenantId: string;
  userId: string;
  tenantSlug: string;
  name: string;
  email: string;
  jobTitle?: string;
  employeeCode?: string;
  roles: string[];
  permissions: string[];
};

export default function Page() {
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const landing = (roles: string[], permissions: string[]) => {
    if (permissions.includes('customer.read')) return '/crm/customers';
    if (permissions.includes('invoice.read') || permissions.includes('payment.read')) return '/finance/invoices';
    if (permissions.includes('trip.read') || permissions.includes('assignment.manage')) return '/operations/trips';
    if (permissions.includes('task.read') || permissions.includes('task.manage')) return '/tasks';
    if (permissions.includes('employee.read')) return '/employees';
    if (roles.some((r) => /owner|director/i.test(r))) return '/dashboard';
    return '/dashboard';
  };

  const go = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('');
    const f = new FormData(e.currentTarget);
    try {
      const payload = {
        email: f.get('email') || undefined,
        employeeCode: f.get('employeeCode') || undefined,
      };
      const r = await apiPost<StaffSigninResponse>('/auth/staff-signin', payload);
      localStorage.setItem('bt_staff_identity', JSON.stringify({ tenantId: r.tenantId, userId: r.userId, name: r.name, email: r.email, roles: r.roles, permissions: r.permissions }));
      router.push(landing(r.roles, r.permissions));
    } catch (x) {
      setMsg(x instanceof Error ? x.message : 'Gagal masuk');
    }
  };

  return (
    <main className="hub">
      <form className="hubForm" onSubmit={go}>
        <span className="hubTag">Akses Internal</span>
        <h1>Masuk ke ERP Staff</h1>
        <p>Gunakan email karyawan atau kode karyawan yang sudah terdaftar di sistem.</p>
        {msg && <div className="hubAlert hubError">{msg}</div>}
        <label>
          Email Staff
          <input name="email" type="email" autoComplete="email" placeholder="sari.sales@demo.local" />
        </label>
        <label>
          Kode Karyawan
          <input name="employeeCode" type="text" placeholder="EMP-DEMO-001" />
        </label>
        <button className="hubBtn blue">Masuk ERP</button>
        <div className="hubAuthLinks">
          Butuh akun pelanggan? <Link href="/sign-in">Masuk pelanggan</Link>
        </div>
      </form>
    </main>
  );
}
