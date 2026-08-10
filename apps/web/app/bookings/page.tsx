'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

type C = { id: string; fullName: string };
type P = { id: string; name: string; serviceLevel?: string; destination?: string; prices?: { sellingPrice: string }[]; minPax?: number; maxPax?: number };
type PassengerLine = { serviceLevel: 'REGULAR' | 'PREMIUM'; passengerType: 'ADULT' | 'CHILD' | 'INFANT'; quantity: number; unitPrice: number; notes?: string };
type B = {
  id: string;
  bookingCode: string;
  packageName: string;
  travelDate: string;
  pax: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  customer: C;
  passengers?: { id: string; serviceLevel: string; passengerType: string; quantity: number; unitPrice: number; totalPrice: number; package?: { name: string; serviceLevel: string } }[];
  invoice?: { invoiceNumber: string };
};
type PageResult<T> = { items: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };

const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const blankLine = (): PassengerLine => ({ serviceLevel: 'REGULAR', passengerType: 'ADULT', quantity: 1, unitPrice: 0, notes: '' });
const priceFactor = (serviceLevel: PassengerLine['serviceLevel'], passengerType: PassengerLine['passengerType']) => {
  const typeFactor = passengerType === 'CHILD' ? 0.75 : passengerType === 'INFANT' ? 0.15 : 1;
  const levelFactor = serviceLevel === 'PREMIUM' ? 1.2 : 1;
  return typeFactor * levelFactor;
};

export default function Page() {
  const [b, setB] = useState<B[]>([]);
  const [c, setC] = useState<C[]>([]);
  const [p, setP] = useState<P[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [lines, setLines] = useState<PassengerLine[]>([blankLine()]);
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(1);
  const [customerDraftId, setCustomerDraftId] = useState('');
  const [pageSize, setPageSize] = useState(8);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState({ page: 1, pageSize: 8, total: 0, totalPages: 1 });

  const load = async () => {
    try {
      const [x, y, z] = await Promise.all([
        apiGet<PageResult<B>>(`/bookings?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),
        apiGet<C[]>('/customers'),
        apiGet<P[]>('/packages'),
      ]);
      setB(x.items);
      setC(y);
      setP(z);
      setMeta(x.meta);
      setPage(x.meta.page);
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, [page, pageSize, search, status]);

  const selectedPackage = useMemo(() => p.find((x) => x.id === selectedPackageId), [p, selectedPackageId]);
  const basePrice = Number(selectedPackage?.prices?.[0]?.sellingPrice || 0);

  const summary = useMemo(() => {
    const pax = lines.reduce((sum, line) => sum + (line.quantity || 0), 0);
    const total = lines.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * (Number(line.quantity) || 0), 0);
    return { pax, total };
  }, [lines]);

  const updateLine = (index: number, patch: Partial<PassengerLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const syncLinePrices = (pkgId: string) => {
    const pkg = p.find((x) => x.id === pkgId);
    const base = Number(pkg?.prices?.[0]?.sellingPrice || 0);
    setLines((prev) => prev.map((line) => ({
      ...line,
      unitPrice: Math.round(base * priceFactor(line.serviceLevel, line.passengerType)),
    })));
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const packageId = selectedPackageId || String(f.get('packageId') || '');
    if (!packageId) {
      setMsg('Pilih paket utama terlebih dahulu.');
      return;
    }
    const packageName = String(f.get('packageName') || selectedPackage?.name || '');
    const passengers = lines.filter((x) => x.quantity > 0 && x.unitPrice > 0).map((x) => ({ ...x, packageId }));
    try {
      await apiPost('/bookings', {
        customerId: f.get('customerId'),
        packageId,
        packageName: packageName || selectedPackage?.name || 'Booking trip',
        travelDate: f.get('travelDate'),
        pax: passengers.length ? passengers.reduce((sum, x) => sum + x.quantity, 0) : Number(f.get('pax') || 1),
        totalAmount: passengers.length ? passengers.reduce((sum, x) => sum + x.quantity * x.unitPrice, 0) : Number(f.get('totalAmount') || 0),
        passengers: passengers.length ? passengers : undefined,
        dueDate: f.get('dueDate') || undefined,
        notes: f.get('notes') || undefined,
      });
      e.currentTarget.reset();
      setLines([blankLine()]);
      setSelectedPackageId('');
      setPage(1);
      await load();
    } catch (x) {
      setMsg((x as Error).message);
    }
  }

  const addLine = () => setLines((prev) => [...prev, { ...blankLine(), unitPrice: basePrice }]);
  const removeLine = (index: number) => setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  const visibleBookings = b;

  async function quickCreateCustomer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      const customer = await apiPost<{ id: string; fullName: string }>('/customers', {
        fullName: f.get('fullName'),
        type: f.get('type') || undefined,
        phone: f.get('phone') || undefined,
        email: f.get('email') || undefined,
        address: f.get('address') || undefined,
        city: f.get('city') || undefined,
        country: f.get('country') || undefined,
        leadSource: 'MANUAL',
        notes: f.get('notes') || undefined,
      });
      setCustomerDraftId(customer.id);
      e.currentTarget.reset();
      await load();
      setMsg(`Customer baru ${customer.fullName} siap dipakai untuk booking.`);
    } catch (x) {
      setMsg((x as Error).message);
    }
  }

  useEffect(() => {
    if (page > meta.totalPages) setPage(meta.totalPages);
  }, [page, meta.totalPages]);

  return (
    <main className="modulePage">
      <div className="moduleHeading">
        <div>
          <p>SALES</p>
          <h1>Booking Management</h1>
          <span>Satu booking hanya untuk satu trip. Dewasa, anak, dan bayi bisa dihitung berbeda di dalam booking yang sama.</span>
        </div>
        <Link href="/finance/invoices">Lihat invoice →</Link>
      </div>

      <div className="crmToolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode booking, paket, customer..." />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Semua status</option>
          <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
          <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          {[8, 12, 24, 48].map((n) => <option key={n} value={n}>{n} / halaman</option>)}
        </select>
        <b>{meta.total} booking</b>
      </div>

      <form className="moduleForm" onSubmit={submit}>
        <label>
          Nama customer
          <select name="customerId" value={customerDraftId} onChange={(e) => setCustomerDraftId(e.target.value)} required>
            <option value="">Pilih customer</option>
            {c.map((x) => <option key={x.id} value={x.id}>{x.fullName}</option>)}
          </select>
        </label>
        <label>
          Paket utama
          <select
            name="packageId"
            value={selectedPackageId}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedPackageId(value);
              syncLinePrices(value);
            }}
            required
          >
            <option value="">Pilih paket / trip</option>
            {p.map((x) => <option key={x.id} value={x.id}>{x.name} {x.serviceLevel ? `· ${x.serviceLevel}` : ''} {x.destination ? `· ${x.destination}` : ''} {x.prices?.[0]?.sellingPrice ? `· ${money(Number(x.prices[0].sellingPrice))}` : ''}</option>)}
          </select>
        </label>
        <label>
          Nama pesanan / trip
          <input name="packageName" placeholder="Contoh: 3H2M Batam - Singapura" />
        </label>
        <label>
          Tanggal trip
          <input name="travelDate" type="date" required />
        </label>
        <label>
          Jumlah peserta total
          <input name="pax" type="number" min="1" placeholder="Jika belum isi rincian peserta" />
        </label>
        <label>
          Total booking
          <input name="totalAmount" type="number" min="1" placeholder="Jika belum isi rincian peserta" />
        </label>
        <label>
          Jatuh tempo invoice
          <input name="dueDate" type="date" />
        </label>
        <label className="bookingNote">
          Catatan booking
          <textarea name="notes" placeholder="Permintaan khusus, info tamu, catatan operasional" />
        </label>

        <section className="bookingPassengers" style={{ gridColumn: '1 / -1' }}>
          <div className="sectionTitle">
            <span>Rincian peserta</span>
            <small className="sectionMeta">Harga otomatis mengikuti paket utama dan jenis peserta</small>
          </div>
          {!selectedPackageId && <p className="errorText">Pilih paket utama dulu agar harga peserta bisa dihitung otomatis.</p>}
          {lines.map((line, index) => (
            <div className="passengerRow" key={index}>
              <label>
                Level layanan
                <select
                  value={line.serviceLevel}
                  onChange={(e) => {
                    const serviceLevel = e.target.value as PassengerLine['serviceLevel'];
                    const unitPrice = Math.round(basePrice * priceFactor(serviceLevel, line.passengerType));
                    updateLine(index, { serviceLevel, unitPrice });
                  }}
                >
                  <option value="REGULAR">REGULAR</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
              </label>
              <label>
                Jenis peserta
                <select
                  value={line.passengerType}
                  onChange={(e) => {
                    const passengerType = e.target.value as PassengerLine['passengerType'];
                    const unitPrice = Math.round(basePrice * priceFactor(line.serviceLevel, passengerType));
                    updateLine(index, { passengerType, unitPrice });
                  }}
                >
                  <option value="ADULT">Dewasa</option>
                  <option value="CHILD">Anak</option>
                  <option value="INFANT">Bayi</option>
                </select>
              </label>
              <label>
                Qty
                <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(index, { quantity: Number(e.target.value) })} />
              </label>
              <label>
                Harga satuan
                <input type="number" min="0" value={line.unitPrice} onChange={(e) => updateLine(index, { unitPrice: Number(e.target.value) })} />
              </label>
              <button type="button" onClick={() => removeLine(index)}>Hapus</button>
              <label className="full">
                Catatan item
                <input value={line.notes || ''} onChange={(e) => updateLine(index, { notes: e.target.value })} placeholder="Contoh: harga anak berbeda, infant free, dll." />
              </label>
            </div>
          ))}
          <div className="bookingTotal"><span>Total dari rincian peserta</span><strong>{money(summary.total)}</strong></div>
          <button type="button" onClick={addLine}>+ Tambah baris peserta</button>
        </section>

        <button className="primary">Buat booking</button>
      </form>

      <details className="leadInbox">
        <summary>＋ Customer Baru untuk Booking</summary>
        <form onSubmit={quickCreateCustomer} className="customerInlineForm">
          <input name="fullName" placeholder="Nama customer" required />
          <select name="type">
            <option value="">Tipe customer</option>
            <option>INDIVIDUAL</option>
            <option>COMPANY</option>
            <option>AGENT</option>
            <option>GROUP</option>
          </select>
          <input name="phone" placeholder="Nomor WhatsApp" />
          <input name="email" type="email" placeholder="Email" />
          <input name="city" placeholder="Kota" />
          <input name="country" placeholder="Negara" />
          <input name="address" className="full" placeholder="Alamat" />
          <textarea name="notes" className="full" placeholder="Catatan customer" />
          <button className="primary">Simpan Customer</button>
        </form>
      </details>

      {msg && <p className="errorText">{msg}</p>}

      <section className="bookingSummary">
        <article><span>Booking di halaman ini</span><b>{b.length}</b></article>
        <article><span>Total pax di halaman ini</span><b>{b.reduce((sum, x) => sum + x.pax, 0)}</b></article>
        <article><span>Total nilai di halaman ini</span><b>{money(b.reduce((sum, x) => sum + Number(x.totalAmount), 0))}</b></article>
      </section>

      <div className="dataTable bookingList">
        <div className="tableRow tableHead"><span>Booking</span><span>Customer</span><span>Nilai</span><span>Status</span></div>
        {visibleBookings.map((x) => (
          <div className="tableRow" key={x.id}>
            <span>
              <b>{x.bookingCode}</b>
              <small>{x.packageName} · {x.pax} pax · {new Date(x.travelDate).toLocaleDateString('id-ID')}</small>
            </span>
            <span>{x.customer.fullName}<small>{x.invoice?.invoiceNumber}</small></span>
            <span>{money(Number(x.totalAmount))}<small>Terbayar {money(Number(x.paidAmount))}</small></span>
            <span>{x.status}</span>
          </div>
        ))}
      </div>

      <div className="paginationBar">
        <button type="button" onClick={() => setPage((v) => Math.max(1, v - 1))} disabled={page === 1}>← Sebelumnya</button>
        <span>Halaman {meta.page} dari {meta.totalPages}</span>
        <button type="button" onClick={() => setPage((v) => Math.min(meta.totalPages, v + 1))} disabled={page === meta.totalPages}>Berikutnya →</button>
      </div>
    </main>
  );
}
