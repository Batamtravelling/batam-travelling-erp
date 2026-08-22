'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPost } from '../lib/api';

type Customer = { id: string; fullName: string; customerCode: string };
type Departure = { id: string; startsAt: string; status: string; remainingPax: number; surchargeLabel?: string; surchargeAmount: string | number; surchargeBasis: 'PER_PAX' | 'PER_BOOKING' };
type Package = { id: string; name: string; status: string; approvalStatus: string; destination?: string; adultPrice?: string; prices?: { sellingPrice: string }[]; departures?: Departure[] };
type Quotation = {
  id: string;
  quotationNumber: string;
  status: string;
  version: number;
  destination?: string;
  travelDate: string;
  pax: number;
  totalAmount: string | number;
  validUntil: string;
  customer: Customer;
  package?: { name: string };
  departure?: { id: string; startsAt: string; status: string };
};
type PageResult<T> = { items: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };

const money = (value: number | string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));
const localDate = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(value));

export function QuotationWorkspace() {
  const [rows, setRows] = useState<Quotation[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [meta, setMeta] = useState({ page: 1, pageSize: 12, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const quotationQuery = new URLSearchParams({ page: String(page), pageSize: '12', search });
      if (status) quotationQuery.set('status', status);
      const [quotationResult, customerResult, packageResult] = await Promise.all([
        apiGet<PageResult<Quotation>>(`/quotations?${quotationQuery}`),
        apiGet<PageResult<Customer>>('/customers?page=1&pageSize=100'),
        apiGet<PageResult<Package>>('/packages?page=1&pageSize=100'),
      ]);
      setRows(quotationResult.items);
      setMeta(quotationResult.meta);
      setCustomers(customerResult.items);
      setPackages(packageResult.items.filter((item) => item.status === 'ACTIVE' && item.approvalStatus === 'APPROVED'));
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal memuat quotation');
    }
  }

  useEffect(() => { void load(); }, [page, search, status]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const packageId = String(data.get('packageId') || '');
    const customName = String(data.get('customName') || '').trim();
    const customPrice = Number(data.get('customPrice') || 0);
    if (!packageId && (!customName || customPrice <= 0)) {
      setMessage('Pilih paket aktif atau isi nama dan harga layanan custom.');
      return;
    }
    setBusy(true);
    try {
      await apiPost('/quotations', {
        customerId: data.get('customerId'),
        packageId: packageId || undefined,
        departureId: data.get('departureId') || undefined,
        travelDate: data.get('travelDate'),
        returnDate: data.get('returnDate') || undefined,
        pax: Number(data.get('pax')),
        destination: data.get('destination') || undefined,
        validUntil: data.get('validUntil'),
        terms: data.get('terms') || undefined,
        notes: data.get('notes') || undefined,
        items: customName ? [{ name: customName, quantity: 1, unit: 'booking', unitPrice: customPrice }] : undefined,
      });
      form.reset();
      setSelectedPackageId('');
      setPage(1);
      await load();
      setMessage('Quotation berhasil dibuat dan snapshot versi 1 tersimpan.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuat quotation');
    } finally {
      setBusy(false);
    }
  }

  async function action(id: string, endpoint: string, body: unknown = {}) {
    setBusy(true);
    try {
      await apiPost(`/quotations/${id}/${endpoint}`, body);
      await load();
      setMessage(`Quotation berhasil ${endpoint === 'send' ? 'dikirim' : endpoint === 'accept' ? 'diterima' : endpoint === 'duplicate' ? 'diduplikasi' : endpoint === 'convert' ? 'dikonversi menjadi booking dan invoice' : 'diperbarui'}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Aksi quotation gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="quotationWorkspace">
      <form className="moduleForm" onSubmit={create}>
        <label>Customer
          <select name="customerId" required><option value="">Pilih customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.customerCode} · {customer.fullName}</option>)}</select>
        </label>
        <label>Paket aktif
          <select name="packageId" value={selectedPackageId} onChange={(event) => setSelectedPackageId(event.target.value)}><option value="">Custom trip / layanan</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name} · {money(item.adultPrice ?? item.prices?.[0]?.sellingPrice ?? 0)}</option>)}</select>
        </label>
        <label>Jadwal Open Trip
          <select name="departureId" disabled={!selectedPackageId}><option value="">Private / tanggal fleksibel</option>{packages.find((item) => item.id === selectedPackageId)?.departures?.map((departure) => <option key={departure.id} value={departure.id} disabled={!['OPEN', 'SCHEDULED'].includes(departure.status) || departure.remainingPax <= 0}>{localDate(departure.startsAt)} · {departure.remainingPax} kursi · {departure.status}</option>)}</select>
        </label>
        <label>Tanggal perjalanan<input name="travelDate" type="date" required /></label>
        <label>Tanggal kembali<input name="returnDate" type="date" /></label>
        <label>Jumlah peserta<input name="pax" type="number" min="1" max="100000" required /></label>
        <label>Berlaku sampai<input name="validUntil" type="date" required /></label>
        <label>Destinasi<input name="destination" maxLength={180} /></label>
        <label>Layanan custom<input name="customName" maxLength={180} placeholder="Kosongkan jika hanya memakai paket" /></label>
        <label>Harga layanan custom<input name="customPrice" type="number" min="0" step="1" /></label>
        <label className="bookingNote">Syarat<textarea name="terms" maxLength={10000} /></label>
        <label className="bookingNote">Catatan internal<textarea name="notes" maxLength={5000} /></label>
        <button className="primaryButton" disabled={busy}>{busy ? 'Memproses…' : 'Buat quotation'}</button>
      </form>

      <div className="crmToolbar">
        <input value={search} onChange={(event) => { setPage(1); setSearch(event.target.value); }} placeholder="Cari nomor, customer, paket, destinasi…" />
        <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }}>
          <option value="">Semua status</option>
          {['DRAFT', 'SENT', 'VIEWED', 'NEGOTIATION', 'ACCEPTED', 'CONVERTED', 'REJECTED', 'EXPIRED', 'CANCELLED'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <b>{meta.total} quotation</b>
      </div>

      {message && <p className={message.includes('berhasil') ? 'successText' : 'errorText'} role="status">{message}</p>}
      <div className="tableScroll">
        <table className="dataTable">
          <thead><tr><th>Nomor</th><th>Customer</th><th>Trip</th><th>Total</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={row.id}>
              <td><b>{row.quotationNumber}</b><small>Versi {row.version}</small></td>
              <td>{row.customer.fullName}</td>
              <td>{row.package?.name ?? row.destination ?? 'Custom trip'}<small>{localDate(row.travelDate)} · {row.pax} pax{row.departure ? ` · ${row.departure.status}` : ''}</small></td>
              <td>{money(row.totalAmount)}<small>Berlaku {localDate(row.validUntil)}</small></td>
              <td><span className="statusBadge">{row.status}</span></td>
              <td><div className="rowActions">
                {['DRAFT', 'READY', 'NEGOTIATION'].includes(row.status) && <button disabled={busy} onClick={() => void action(row.id, 'send')}>Kirim</button>}
                {['SENT', 'VIEWED', 'NEGOTIATION'].includes(row.status) && <button disabled={busy} onClick={() => void action(row.id, 'accept', { method: 'MANUAL' })}>Terima manual</button>}
                {row.status === 'ACCEPTED' && <button disabled={busy} onClick={() => void action(row.id, 'convert')}>Buat booking</button>}
                <button disabled={busy} onClick={() => void action(row.id, 'duplicate')}>Duplikat</button>
              </div></td>
            </tr>)}
            {!rows.length && <tr><td colSpan={6}>Belum ada quotation untuk filter ini.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span>Halaman {meta.page} dari {meta.totalPages}</span><button disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></div>
    </div>
  );
}
