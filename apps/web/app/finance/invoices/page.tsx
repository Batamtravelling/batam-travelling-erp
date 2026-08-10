'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';

type I = { id: string; invoiceNumber: string; status: string; issuedAt: string; totalAmount: number; paidAmount: number; customer: { fullName: string }; booking: { bookingCode: string; packageName: string } };
type Meta = { page: number; pageSize: number; total: number; totalPages: number };
type PageResult<T> = { items: T[]; meta: Meta };
const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const sortOptions = [
  { value: 'LATEST', label: 'Terbaru' },
  { value: 'OLDEST', label: 'Terlama' },
  { value: 'VALUE_DESC', label: 'Nilai terbesar' },
];

export default function Page() {
  const [items, setItems] = useState<I[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, pageSize: 12, total: 0, totalPages: 1 });
  const [m, setM] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'LATEST' | 'OLDEST' | 'VALUE_DESC'>('LATEST');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiGet<PageResult<I>>(`/invoices?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(debouncedSearch)}&sort=${sort}`)
      .then((res) => { setItems(res.items); setMeta(res.meta); if (page > res.meta.totalPages) setPage(res.meta.totalPages); })
      .catch((e) => setM(e.message));
  }, [page, pageSize, debouncedSearch, sort]);

  const total = meta.total;
  const totalAmount = items.reduce((s, x) => s + Number(x.totalAmount), 0);
  const paid = items.reduce((s, x) => s + Number(x.paidAmount), 0);

  return (
    <main className="modulePage">
      <div className="moduleHeading"><div><p>FINANCE</p><h1>Invoice</h1><span>Invoice diterbitkan otomatis dari booking dan tidak diedit langsung.</span></div><Link href="/finance/payments">Catat pembayaran →</Link></div>
      <div className="crmToolbar">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari invoice, booking, customer..." />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>{sortOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>{[12, 24, 48].map((n) => <option key={n} value={n}>{n} / halaman</option>)}</select>
        <b>{total} invoice</b>
      </div>
      {m && <p className="errorText">{m}</p>}
      <section className="ownerMetrics"><article><span>Total invoice</span><strong>{meta.total}</strong></article><article><span>Nilai tagihan</span><strong>{money(totalAmount)}</strong></article><article><span>Terbayar</span><strong>{money(paid)}</strong></article><article><span>Outstanding</span><strong>{money(totalAmount - paid)}</strong></article></section>
      <div className="dataTable">
        <div className="tableRow tableHead"><span>Invoice</span><span>Customer / Booking</span><span>Nilai</span><span>Status</span></div>
        {items.map((x) => <div className="tableRow" key={x.id}><span><b>{x.invoiceNumber}</b><small>Terbit {new Date(x.issuedAt).toLocaleDateString('id-ID')}</small></span><span>{x.customer.fullName}<small>{x.booking.bookingCode} · {x.booking.packageName}</small></span><span>{money(Number(x.totalAmount))}<small>Outstanding {money(Number(x.totalAmount) - Number(x.paidAmount))}</small></span><span>{x.status}</span></div>)}
      </div>
      <div className="paginationBar"><button type="button" onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={meta.page === 1}>Prev</button><span>Page {meta.page} of {meta.totalPages}</span><button type="button" onClick={() => setPage((v) => Math.min(meta.totalPages, v + 1))} disabled={meta.page === meta.totalPages}>Next</button></div>
    </main>
  );
}
