'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../lib/api';

type Row = Record<string, string | number | null>;
type Meta = { page: number; pageSize: number; total: number; totalPages: number };
type Report = {
  period: string;
  summary: { bookingCount: number; pax: number; bookingValue: number; invoiced: number; received: number; outstanding: number; paymentCount: number };
  bookings: Row[];
  payments: Row[];
  bookingsMeta: Meta;
  paymentsMeta: Meta;
};

const money = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v);
const csv = (name: string, rows: Row[]) => {
  if (!rows.length) return alert('Belum ada data untuk diekspor.');
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
  const text = '\ufeff' + [keys.join(','), ...rows.map((r) => keys.map((k) => escape(r[k])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};
const sortOptions = [
  { value: 'LATEST', label: 'Terbaru' },
  { value: 'OLDEST', label: 'Terlama' },
  { value: 'VALUE_DESC', label: 'Nilai terbesar' },
];

export default function Page() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [annual, setAnnual] = useState(false);
  const [sort, setSort] = useState<'LATEST' | 'OLDEST' | 'VALUE_DESC'>('LATEST');
  const [bookingPage, setBookingPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [paymentPageSize, setPaymentPageSize] = useState(10);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [data, setData] = useState<Report>();
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const load = async () => {
    try {
      const q = new URLSearchParams({ year: String(year), sort, bookingPage: String(bookingPage), bookingPageSize: String(bookingPageSize), paymentPage: String(paymentPage), paymentPageSize: String(paymentPageSize) });
      if (!annual) q.set('month', String(month));
      if (debouncedQuery) q.set('search', debouncedQuery);
      const res = await apiGet<Report>(`/reports/business?${q.toString()}`);
      setData(res);
      setMsg('');
      setBookingPage(res.bookingsMeta.page);
      setPaymentPage(res.paymentsMeta.page);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => { load(); }, [year, month, annual, sort, bookingPage, bookingPageSize, paymentPage, paymentPageSize, debouncedQuery]);

  const printTitle = useMemo(() => (data ? `Periode ${data.period}` : ''), [data]);

  return (
    <main className="reportPage">
      <header className="reportHero noPrint">
        <div>
          <span>FINANCE & BOOKING REPORTS</span>
          <h1>Reporting & Backup Center</h1>
          <p>Rekap transaksi bulanan/tahunan, cetak laporan, dan ekspor cadangan untuk Excel atau Google Sheets.</p>
        </div>
        <button onClick={() => window.print()}>🖨️ Cetak Laporan</button>
      </header>

      <section className="reportFilters noPrint">
        <label>Tahun<input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} /></label>
        <label>Bulan<select value={month} disabled={annual} onChange={(e) => setMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, n) => <option key={n} value={n + 1}>{new Date(2026, n, 1).toLocaleDateString('id-ID', { month: 'long' })}</option>)}</select></label>
        <label className="annualCheck"><input type="checkbox" checked={annual} onChange={(e) => setAnnual(e.target.checked)} /> Rekap satu tahun</label>
        <label>Cari<input value={query} onChange={(e) => { setQuery(e.target.value); setBookingPage(1); setPaymentPage(1); }} placeholder="Cari booking / invoice / customer..." /></label>
        <label>Urutkan<select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>{sortOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label>
        <label>Booking/halaman<select value={bookingPageSize} onChange={(e) => setBookingPageSize(Number(e.target.value))}>{[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <label>Payment/halaman<select value={paymentPageSize} onChange={(e) => setPaymentPageSize(Number(e.target.value))}>{[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}</select></label>
        <button onClick={() => data && csv(`booking-${data.period}.csv`, data.bookings)}>⬇ Booking CSV</button>
        <button onClick={() => data && csv(`keuangan-${data.period}.csv`, data.payments)}>⬇ Keuangan CSV</button>
      </section>

      {msg && <p>{msg}</p>}

      {data && (
        <>
          <div className="printTitle"><h1>Laporan Batam Travelling</h1><p>{printTitle}</p></div>
          <section className="reportStats">
            <article><small>Booking</small><b>{data.summary.bookingCount}</b><span>{data.summary.pax} peserta</span></article>
            <article><small>Nilai Booking</small><b>{money(data.summary.bookingValue)}</b><span>total periode</span></article>
            <article><small>Dana Diterima</small><b>{money(data.summary.received)}</b><span>{data.summary.paymentCount} transaksi</span></article>
            <article><small>Outstanding</small><b>{money(data.summary.outstanding)}</b><span>belum dibayar</span></article>
          </section>

          <section className="reportPanel">
            <div className="panelTitle"><h2>Rekap Booking Pelanggan</h2><span>{data.period}</span></div>
            <div className="reportTable">
              <table>
                <thead><tr><th>Tanggal</th><th>Kode</th><th>Pelanggan</th><th>Paket</th><th>Trip</th><th>Pax</th><th>Status</th><th>Total</th><th>Dibayar</th></tr></thead>
                <tbody>{data.bookings.map((b, n) => <tr key={n}><td>{new Date(String(b.tanggal)).toLocaleDateString('id-ID')}</td><td>{b.kode}</td><td>{b.pelanggan}<small>{b.telepon}</small></td><td>{b.paket}</td><td>{new Date(String(b.tanggalTrip)).toLocaleDateString('id-ID')}</td><td>{b.pax}</td><td>{b.status}</td><td>{money(Number(b.total))}</td><td>{money(Number(b.dibayar))}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="paginationBar"><button type="button" onClick={() => setBookingPage((v) => Math.max(1, v - 1))} disabled={data.bookingsMeta.page === 1}>Prev</button><span>Page {data.bookingsMeta.page} of {data.bookingsMeta.totalPages}</span><button type="button" onClick={() => setBookingPage((v) => Math.min(data.bookingsMeta.totalPages, v + 1))} disabled={data.bookingsMeta.page === data.bookingsMeta.totalPages}>Next</button></div>
          </section>

          <section className="reportPanel">
            <div className="panelTitle"><h2>Transaksi Keuangan</h2><span>{data.period}</span></div>
            <div className="reportTable">
              <table>
                <thead><tr><th>Tanggal</th><th>Nomor</th><th>Invoice</th><th>Pelanggan</th><th>Metode</th><th>Status</th><th>Jumlah</th><th>Diterima oleh</th></tr></thead>
                <tbody>{data.payments.map((p, n) => <tr key={n}><td>{new Date(String(p.tanggal)).toLocaleDateString('id-ID')}</td><td>{p.nomor}</td><td>{p.invoice}</td><td>{p.pelanggan}</td><td>{p.metode}</td><td>{p.status}</td><td>{money(Number(p.jumlah))}</td><td>{p.diterimaOleh}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="paginationBar"><button type="button" onClick={() => setPaymentPage((v) => Math.max(1, v - 1))} disabled={data.paymentsMeta.page === 1}>Prev</button><span>Page {data.paymentsMeta.page} of {data.paymentsMeta.totalPages}</span><button type="button" onClick={() => setPaymentPage((v) => Math.min(data.paymentsMeta.totalPages, v + 1))} disabled={data.paymentsMeta.page === data.paymentsMeta.totalPages}>Next</button></div>
          </section>
          <p className="backupNote noPrint">File CSV dapat langsung dibuka di Microsoft Excel atau diimpor melalui Google Sheets → File → Import → Upload.</p>
        </>
      )}
    </main>
  );
}
