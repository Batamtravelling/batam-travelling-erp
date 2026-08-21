'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

type Me = {
  name: string;
  jobTitle?: string;
  role: string;
  permissions: string[];
};

type Data = {
  leads: number;
  customers: number;
  bookings: number;
  outstanding: number;
  myTasks: {
    id: string;
    title: string;
    dueDate?: string;
    project?: { name: string } | null;
    trip?: { tripCode: string; title: string } | null;
  }[];
  myTrips: {
    id: string;
    tripCode: string;
    title: string;
    startsAt: string;
    status: string;
  }[];
};

const money = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

export default function Dashboard() {
  const [me, setMe] = useState<Me>();
  const [d, setD] = useState<Data>();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([apiGet<Me>('/auth/me'), apiGet<Data>('/dashboard/role')])
      .then(([a, b]) => {
        setMe(a);
        setD(b);
      })
      .catch((e) => setMsg((e as Error).message));
  }, []);

  const can = (p: string) => me?.permissions.includes(p);

  return (
    <main className="modulePage roleDashboard">
      <div className="moduleHeading">
        <div>
          <p>{me?.role || 'DASHBOARD'}</p>
          <h1>Selamat datang, {me?.name || '...'}</h1>
          <span>{me?.jobTitle || 'Ringkasan kerja hari ini sesuai akses Anda.'}</span>
        </div>
        <Link href="/">Lihat Website →</Link>
      </div>

      {msg && <p className="errorText">{msg}</p>}

      <section className="ownerMetrics">
        {can('lead.read') && (
          <article>
            <span>Lead aktif</span>
            <b>{d?.leads ?? '—'}</b>
          </article>
        )}
        {can('customer.read') && (
          <article>
            <span>Customer</span>
            <b>{d?.customers ?? '—'}</b>
          </article>
        )}
        {can('booking.read') && (
          <article>
            <span>Booking berjalan</span>
            <b>{d?.bookings ?? '—'}</b>
          </article>
        )}
        {can('invoice.read') && (
          <article>
            <span>Outstanding</span>
            <b>{d ? money(d.outstanding) : '—'}</b>
          </article>
        )}
      </section>

      <div className="dashboardColumns">
        <section className="panel">
          <div className="panelHead">
            <h2>Tugas saya</h2>
            {can('task.read') && <Link href="/tasks">Buka planner</Link>}
          </div>
          {d?.myTasks.map((x) => {
            const parent = x.project?.name ?? (x.trip ? `${x.trip.tripCode} · ${x.trip.title}` : 'Tugas operasional');
            return (
              <article className="dashboardRow" key={x.id}>
                <b>{x.title}</b>
                <span>
                  {parent} · {x.dueDate ? new Date(x.dueDate).toLocaleDateString('id-ID') : 'Tanpa tenggat'}
                </span>
              </article>
            );
          })}
          {!d?.myTasks.length && <p className="empty">Tidak ada tugas aktif.</p>}
        </section>

        <section className="panel">
          <div className="panelHead">
            <h2>Trip saya</h2>
            {can('trip.read') && <Link href="/operations/trips">Buka operasi</Link>}
          </div>
          {d?.myTrips.map((x) => (
            <article className="dashboardRow" key={x.id}>
              <b>
                {x.tripCode} · {x.title}
              </b>
              <span>
                {new Date(x.startsAt).toLocaleString('id-ID')} · {x.status}
              </span>
            </article>
          ))}
          {!d?.myTrips.length && <p className="empty">Tidak ada assignment trip.</p>}
        </section>
      </div>

      <section className="dashboardActions">
        {can('booking.manage') && <Link href="/pos">Buka POS</Link>}
        {can('lead.create') && <Link href="/crm/customers">Tambah lead</Link>}
        {can('content.manage') && <Link href="/content">Kelola konten</Link>}
        {can('archive.manage') && <Link href="/archives">Arsip dokumen</Link>}
      </section>
    </main>
  );
}
