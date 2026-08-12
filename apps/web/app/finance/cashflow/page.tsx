'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

type Item = {
  id: string;
  direction: string;
  costType: string;
  category: string;
  description: string;
  amount: string;
  transactionDate: string;
  fixedCost: boolean;
  project?: { name: string };
  trip?: { title: string };
  vendor?: { name: string };
};
type Project = { id: string; name: string };
type Trip = { id: string; title: string };
type Vendor = { id: string; name: string };
type D = { entries: Item[]; summary: { incoming: number; outgoing: number; balance: number; operational: number; fixed: number } };
type PageResult<T> = { items: T[] };

const m = (v: number | string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v));

export default function Page() {
  const [d, setD] = useState<D>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const load = async () => {
    const [cash, projectRows, tripRows, vendorRows] = await Promise.all([
      apiGet<D>(`/cashflow?year=${year}&month=${month}`),
      apiGet<PageResult<Project>>('/projects?page=1&pageSize=100'),
      apiGet<PageResult<Trip>>('/trips?page=1&pageSize=100'),
      apiGet<PageResult<Vendor>>('/vendors?page=1&pageSize=100'),
    ]);
    setD(cash);
    setProjects(projectRows.items);
    setTrips(tripRows.items);
    setVendors(vendorRows.items);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, [year, month]);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await apiPost('/cashflow', {
      direction: f.get('direction'),
      costType: f.get('costType'),
      category: f.get('category'),
      description: f.get('description'),
      amount: Number(f.get('amount')),
      transactionDate: f.get('transactionDate'),
      reference: f.get('reference') || undefined,
      projectId: f.get('projectId') || undefined,
      tripId: f.get('tripId') || undefined,
      vendorId: f.get('vendorId') || undefined,
      fixedCost: Boolean(f.get('fixedCost')),
      notes: f.get('notes') || undefined,
    });
    e.currentTarget.reset();
    await load();
  };

  return (
    <main className="vendorPage">
      <header className="vendorHero">
        <div>
          <span>FINANCIAL CONTROL</span>
          <h1>Arus Kas & Biaya</h1>
          <p>Uang masuk/keluar, biaya operasional, biaya tetap, Project, Trip, dan Vendor.</p>
        </div>
      </header>

      <div className="cashFilters">
        <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {Array.from({ length: 12 }, (_, n) => (
            <option key={n} value={n + 1}>
              {new Date(2026, n, 1).toLocaleDateString('id-ID', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>

      {d && (
        <section className="vendorStats">
          <article><small>Uang Masuk</small><b>{m(d.summary.incoming)}</b></article>
          <article><small>Uang Keluar</small><b>{m(d.summary.outgoing)}</b></article>
          <article><small>Saldo</small><b>{m(d.summary.balance)}</b></article>
          <article><small>Operasional</small><b>{m(d.summary.operational)}</b></article>
          <article><small>Biaya Tetap</small><b>{m(d.summary.fixed)}</b></article>
        </section>
      )}

      <section className="cashGrid">
        <form className="vendorForm" onSubmit={save}>
          <h2>Catat Transaksi</h2>
          <div className="vTwo">
            <label>Arah<select name="direction"><option>OUT</option><option>IN</option></select></label>
            <label>Jenis<select name="costType"><option>OPERATIONAL</option><option>FIXED</option><option>PROJECT</option><option>TRIP</option><option>VENDOR</option><option>REVENUE</option><option>OTHER</option></select></label>
            <label>Kategori<input name="category" required /></label>
            <label>Tanggal<input name="transactionDate" type="date" required /></label>
            <label>Jumlah<input name="amount" type="number" min="0" required /></label>
            <label>Referensi<input name="reference" /></label>
            <label>Project<select name="projectId"><option value="">Tanpa project</option>{projects.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label>Trip<select name="tripId"><option value="">Tanpa trip</option>{trips.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}</select></label>
            <label>Vendor<select name="vendorId"><option value="">Tanpa vendor</option>{vendors.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          </div>
          <label>Deskripsi<input name="description" required /></label>
          <label className="check"><input name="fixedCost" type="checkbox" /> Biaya tetap</label>
          <label>Catatan<textarea name="notes" /></label>
          <button>Simpan Transaksi</button>
        </form>

        <section className="vendorCards cashList">
          {d?.entries.map((x) => (
            <article key={x.id}>
              <header>
                <div>
                  <small>{new Date(x.transactionDate).toLocaleDateString('id-ID')} · {x.costType}</small>
                  <h3>{x.description}</h3>
                  <span>{x.category}{x.fixedCost ? ' · BIAYA TETAP' : ''}</span>
                  <span>{x.project?.name || x.trip?.title || x.vendor?.name || ''}</span>
                </div>
                <em className={x.direction}>{x.direction === 'IN' ? '+' : '-'} {m(x.amount)}</em>
              </header>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
