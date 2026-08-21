'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { apiGet, apiPatch, apiPost, apiUpload } from '../../../lib/api';

type InvoiceRow = { id: string; invoiceNumber: string; issuedAt: string; status: string; totalAmount: number; paidAmount: number; customer: { fullName: string }; booking: { bookingCode: string; packageName: string } };
type P = { id: string; paymentNumber: string; receiptNumber?: string; amount: number; method: string; status: string; reference?: string; receivedAt: string; verifiedAt?: string; canVerify: boolean; customer: { fullName: string }; invoice: { invoiceNumber: string }; receivedBy?: { name: string }; verifiedBy?: { name: string }; proofs: { id: string; originalName: string; mimeType: string; size: number; createdAt: string }[] };
type Brand = { documentLogoUrl?: string; contactEmail?: string; whatsappNumber?: string; contactAddress?: string };
type Meta = { page: number; pageSize: number; total: number; totalPages: number };
type PageResult<T> = { items: T[]; meta: Meta };

const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const pageSizes = [12, 24, 48];
const csv = (name: string, rows: Record<string, string | number | null>[]) => {
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

export default function Page() {
  const paymentIdempotencyKey = useRef(crypto.randomUUID());
  const [items, setItems] = useState<P[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [brand, setBrand] = useState<Brand>({});
  const [receipt, setReceipt] = useState<P>();
  const [m, setM] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState<Meta>({ page: 1, pageSize: 12, total: 0, totalPages: 1 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFrom, setInvoiceFrom] = useState('');
  const [invoiceTo, setInvoiceTo] = useState('');
  const [invoiceSort, setInvoiceSort] = useState<'LATEST' | 'OLDEST' | 'VALUE_DESC'>('LATEST');
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(12);
  const [invoiceMeta, setInvoiceMeta] = useState<Meta>({ page: 1, pageSize: 12, total: 0, totalPages: 1 });
  const [debouncedInvoiceSearch, setDebouncedInvoiceSearch] = useState('');
  const [debouncedPaymentsSearch, setDebouncedPaymentsSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedInvoiceSearch(invoiceSearch.trim()), 350);
    return () => clearTimeout(t);
  }, [invoiceSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedPaymentsSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    try {
      const paymentQuery = new URLSearchParams({ page: String(page), pageSize: String(pageSize), search: debouncedPaymentsSearch });
      if (status) paymentQuery.set('status', status);
      const [a, b, c] = await Promise.all([
        apiGet<PageResult<P>>(`/payments?${paymentQuery}`),
        apiGet<PageResult<InvoiceRow>>(`/invoices?page=${invoicePage}&pageSize=${invoicePageSize}&search=${encodeURIComponent(debouncedInvoiceSearch)}&sort=${invoiceSort}${invoiceFrom ? `&from=${encodeURIComponent(invoiceFrom)}` : ''}${invoiceTo ? `&to=${encodeURIComponent(invoiceTo)}` : ''}`),
        apiGet<Brand>('/public/company-profile'),
      ]);
      setItems(a.items);
      setMeta(a.meta);
      setInvoices(b.items);
      setInvoiceMeta(b.meta);
      setBrand(c || {});
      if (page > a.meta.totalPages) setPage(a.meta.totalPages);
      if (invoicePage > b.meta.totalPages) setInvoicePage(b.meta.totalPages);
    } catch (e) {
      setM((e as Error).message);
    }
  };

  useEffect(() => { load(); }, [page, pageSize, debouncedPaymentsSearch, status, invoicePage, invoicePageSize, debouncedInvoiceSearch, invoiceFrom, invoiceTo, invoiceSort]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await apiPost('/payments', { invoiceId: f.get('invoiceId'), amount: Number(f.get('amount')), method: f.get('method'), reference: f.get('reference') || undefined }, { 'Idempotency-Key': paymentIdempotencyKey.current });
      paymentIdempotencyKey.current = crypto.randomUUID();
      e.currentTarget.reset();
      await load();
    } catch (x) {
      setM((x as Error).message);
    }
  }

  async function uploadProof(event: FormEvent<HTMLFormElement>, paymentId: string) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      await apiUpload(`/payments/${paymentId}/proof`, new FormData(form));
      form.reset();
      setM('Bukti pembayaran tersimpan di private storage dan menunggu verifikasi.');
      await load();
    } catch (error) {
      setM((error as Error).message);
    }
  }

  async function openProof(paymentId: string, proofId: string) {
    try {
      const signed = await apiGet<{ url: string }>(`/payments/${paymentId}/proofs/${proofId}/url`);
      window.open(signed.url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setM((error as Error).message);
    }
  }

  async function verifyPayment(paymentId: string, status: 'VERIFIED' | 'REJECTED') {
    try {
      setM('');
      await apiPatch(`/payments/${paymentId}/verify`, { status });
      await load();
    } catch (error) {
      setM((error as Error).message);
    }
  }

  const print = (x: P) => { setReceipt(x); setTimeout(() => window.print(), 50); };
  const exportInvoices = () => {
    csv(`invoice-filtered-${invoiceMeta.page}.csv`, invoices.map((x) => ({
      invoiceNumber: x.invoiceNumber,
      issuedAt: new Date(x.issuedAt).toLocaleString('id-ID'),
      customer: x.customer.fullName,
      bookingCode: x.booking.bookingCode,
      packageName: x.booking.packageName,
      status: x.status,
      totalAmount: x.totalAmount,
      paidAmount: x.paidAmount,
      outstanding: Number(x.totalAmount) - Number(x.paidAmount),
    })));
  };

  return (
    <main className="modulePage financePage">
      <div className="moduleHeading">
        <div>
          <p>FINANCE</p>
          <h1>Payment & Verification</h1>
          <span>Bukti pembayaran otomatis tersedia setelah transaksi diverifikasi.</span>
        </div>
      </div>

      <form className="moduleForm" onSubmit={submit}>
        <label>
          Invoice
          <select name="invoiceId" required>
            <option value="">Pilih invoice</option>
            {invoices.filter((x) => Number(x.paidAmount) < Number(x.totalAmount)).map((x) => <option key={x.id} value={x.id}>{x.invoiceNumber} · {x.customer.fullName} · {money(Number(x.totalAmount) - Number(x.paidAmount))}</option>)}
          </select>
        </label>
        <label>
          Jumlah pembayaran
          <input name="amount" type="number" min="1" placeholder="Jumlah" required />
        </label>
        <label>
          Metode
          <select name="method">
            <option>BANK_TRANSFER</option>
            <option>CASH</option>
            <option>QRIS</option>
          </select>
        </label>
        <label>
          Referensi
          <input name="reference" placeholder="Referensi" />
        </label>
        <button className="primary">Catat payment</button>
      </form>

      {m && <p className="errorText">{m}</p>}

      <div className="crmToolbar">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); setInvoicePage(1); }} placeholder="Cari payment / invoice / customer..." />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Semua status</option>
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>{pageSizes.map((n) => <option key={n} value={n}>{n} / halaman</option>)}</select>
        <b>{meta.total} payment</b>
      </div>

      <section className="dataTable financeTable">
        <div className="tableRow tableHead"><span>Payment</span><span>Invoice / Customer</span><span>Nilai</span><span>Status / Dokumen</span></div>
        {items.map((x) => <div className="tableRow" key={x.id}><span><b>{x.paymentNumber}</b><small>{x.receiptNumber || new Date(x.receivedAt).toLocaleString('id-ID')}</small></span><span>{x.invoice.invoiceNumber}<small>{x.customer.fullName} · {x.method}{x.receivedBy?.name ? ` · dicatat ${x.receivedBy.name}` : ''}</small>{x.proofs?.map((proof) => <button type="button" key={proof.id} onClick={() => void openProof(x.id, proof.id)}>Lihat {proof.originalName}</button>)}</span><span>{money(Number(x.amount))}</span><span>{x.status === 'PENDING' ? <><form onSubmit={(event) => void uploadProof(event, x.id)}><input name="file" type="file" accept="image/png,image/jpeg,image/webp,application/pdf" required/><button type="submit">Upload bukti</button></form>{x.canVerify ? <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><button type="button" onClick={() => void verifyPayment(x.id, 'VERIFIED')}>Verifikasi</button><button type="button" onClick={() => void verifyPayment(x.id, 'REJECTED')}>Tolak</button></span> : <small>Four Eyes aktif · menunggu verifikasi pengguna lain</small>}</> : <><b>{x.status}</b>{x.status === 'VERIFIED' && <button type="button" className="receiptButton" onClick={() => print(x)}>Print Bukti</button>}</>}</span></div>)}
      </section>

      <div className="paginationBar">
        <button type="button" onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={meta.page === 1}>Prev</button>
        <span>Page {meta.page} of {meta.totalPages}</span>
        <button type="button" onClick={() => setPage((v) => Math.min(meta.totalPages, v + 1))} disabled={meta.page === meta.totalPages}>Next</button>
      </div>

      <section className="reportPage financeReport" style={{ marginTop: '24px' }}>
        <div className="reportHero noPrint">
          <div>
            <span>INVOICE FILTER</span>
            <h1>Filter Invoice Berdasarkan Tanggal</h1>
            <p>Gunakan rentang tanggal untuk menemukan invoice lebih cepat dan lebih presisi.</p>
            <button type="button" onClick={exportInvoices}>Export CSV hasil filter</button>
          </div>
        </div>

        <div className="reportFilters noPrint">
          <label>
            Cari Invoice
            <input value={invoiceSearch} onChange={(e) => { setInvoiceSearch(e.target.value); setInvoicePage(1); }} placeholder="Nomor invoice, booking, customer..." />
          </label>
          <label>
            Dari tanggal
            <input type="date" value={invoiceFrom} onChange={(e) => { setInvoiceFrom(e.target.value); setInvoicePage(1); }} />
          </label>
          <label>
            Sampai tanggal
            <input type="date" value={invoiceTo} onChange={(e) => { setInvoiceTo(e.target.value); setInvoicePage(1); }} />
          </label>
          <label>
            Urutkan
            <select value={invoiceSort} onChange={(e) => { setInvoiceSort(e.target.value as typeof invoiceSort); setInvoicePage(1); }}>
              <option value="LATEST">Terbaru</option>
              <option value="OLDEST">Terlama</option>
              <option value="VALUE_DESC">Nilai terbesar</option>
            </select>
          </label>
          <label>
            Invoice/halaman
            <select value={invoicePageSize} onChange={(e) => { setInvoicePageSize(Number(e.target.value)); setInvoicePage(1); }}>{pageSizes.map((n) => <option key={n} value={n}>{n}</option>)}</select>
          </label>
        </div>

        <section className="ownerMetrics">
          <article><span>Total invoice</span><strong>{invoiceMeta.total}</strong></article>
          <article><span>Nilai tagihan</span><strong>{money(invoices.reduce((s, x) => s + Number(x.totalAmount), 0))}</strong></article>
          <article><span>Terbayar</span><strong>{money(invoices.reduce((s, x) => s + Number(x.paidAmount), 0))}</strong></article>
          <article><span>Outstanding</span><strong>{money(invoices.reduce((s, x) => s + Number(x.totalAmount) - Number(x.paidAmount), 0))}</strong></article>
        </section>

        <section className="dataTable financeTable">
          <div className="tableRow tableHead"><span>Invoice</span><span>Customer / Booking</span><span>Nilai</span><span>Status</span></div>
          {invoices.map((x) => <div className="tableRow" key={x.id}><span><b>{x.invoiceNumber}</b><small>Terbit {new Date(x.issuedAt).toLocaleDateString('id-ID')}</small></span><span>{x.customer.fullName}<small>{x.booking.bookingCode} · {x.booking.packageName}</small></span><span>{money(Number(x.totalAmount))}<small>Outstanding {money(Number(x.totalAmount) - Number(x.paidAmount))}</small></span><span>{x.status}</span></div>)}
        </section>

        <div className="paginationBar">
          <button type="button" onClick={() => setInvoicePage((v) => Math.max(1, v - 1))} disabled={invoiceMeta.page === 1}>Prev</button>
          <span>Page {invoiceMeta.page} of {invoiceMeta.totalPages}</span>
          <button type="button" onClick={() => setInvoicePage((v) => Math.min(invoiceMeta.totalPages, v + 1))} disabled={invoiceMeta.page === invoiceMeta.totalPages}>Next</button>
        </div>
      </section>

      {receipt && <section className="paymentReceipt"><header>{brand.documentLogoUrl ? <img src={brand.documentLogoUrl} alt="Logo" /> : <strong>BATAM TRAVELLING</strong>}<div><h1>BUKTI PEMBAYARAN</h1><b>{receipt.receiptNumber}</b></div></header><div className="receiptMeta"><p><span>Diterima dari</span><b>{receipt.customer.fullName}</b></p><p><span>Nomor invoice</span><b>{receipt.invoice.invoiceNumber}</b></p><p><span>Tanggal</span><b>{new Date(receipt.verifiedAt || receipt.receivedAt).toLocaleString('id-ID')}</b></p><p><span>Metode</span><b>{receipt.method}</b></p><p><span>Referensi</span><b>{receipt.reference || '—'}</b></p></div><div className="receiptAmount"><span>Jumlah diterima</span><strong>{money(Number(receipt.amount))}</strong></div><footer><p>Pembayaran telah diverifikasi dan tercatat dalam sistem.</p><small>{brand.contactAddress} · {brand.contactEmail} · WhatsApp +{brand.whatsappNumber}</small></footer></section>}
    </main>
  );
}
