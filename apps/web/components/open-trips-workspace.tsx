'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api';

type Departure = {
  id: string;
  startsAt: string;
  endsAt?: string | null;
  bookingCloseAt?: string | null;
  status: string;
  maxPax: number;
  reservedPax: number;
  remainingPax: number;
  occupancyPercent: number;
  bookingCount: number;
  surchargeAmount: number | string;
  surchargeBasis: string;
  package: { id: string; name: string };
};

type Meta = { page: number; pageSize: number; total: number; totalPages: number };
const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export function OpenTripsWorkspace() {
  const [items, setItems] = useState<Departure[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      apiGet<{ items: Departure[]; meta: Meta }>(`/open-trips?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`)
        .then((result) => { setItems(result.items); setMeta(result.meta); setError(''); })
        .catch((reason) => setError((reason as Error).message));
    }, 250);
    return () => clearTimeout(timer);
  }, [page, search]);

  const summary = useMemo(() => items.reduce((value, item) => ({
    capacity: value.capacity + item.maxPax,
    reserved: value.reserved + item.reservedPax,
    remaining: value.remaining + item.remainingPax,
  }), { capacity: 0, reserved: 0, remaining: 0 }), [items]);

  return <main className="otPage">
    <header className="otHeader">
      <div><p>OPERATIONS</p><h1>Open Trips</h1><span>Pantau okupansi berdasarkan jumlah pax aktif, sisa kursi, cutoff, dan surcharge tiap keberangkatan.</span></div>
      <a href="/bookings">Buka Booking</a>
    </header>
    {error && <p className="otAlert">{error}</p>}
    <section className="otKpis">
      <article><span>Keberangkatan di halaman</span><b>{items.length}</b><small>{meta.total} total jadwal</small></article>
      <article><span>Kapasitas</span><b>{summary.capacity}</b><small>pax pada halaman ini</small></article>
      <article><span>Kursi terisi</span><b>{summary.reserved}</b><small>pax booking aktif</small></article>
      <article><span>Sisa kursi</span><b>{summary.remaining}</b><small>siap dijual</small></article>
    </section>
    <div className="crmToolbar"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari nama paket…" /></div>
    <section className="workspaceCards">
      {items.map((item) => <article key={item.id}>
        <small>{item.status}</small>
        <h2>{item.package.name}</h2>
        <p>{date.format(new Date(item.startsAt))}</p>
        <div className="otProgress" aria-label={`Okupansi ${item.occupancyPercent}%`}><i style={{ width: `${item.occupancyPercent}%` }} /></div>
        <p><strong>{item.reservedPax}/{item.maxPax} pax</strong> · {item.remainingPax} kursi tersisa · {item.bookingCount} booking</p>
        {item.bookingCloseAt && <p>Cutoff: {date.format(new Date(item.bookingCloseAt))}</p>}
        <p>Surcharge: {rupiah.format(Number(item.surchargeAmount))} {item.surchargeBasis === 'PER_PAX' ? '/ pax' : '/ booking'}</p>
      </article>)}
      {!items.length && !error && <p className="empty">Belum ada jadwal Open Trip.</p>}
    </section>
    <div className="paginationBar"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span>Halaman {meta.page} dari {meta.totalPages}</span><button disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></div>
  </main>;
}
