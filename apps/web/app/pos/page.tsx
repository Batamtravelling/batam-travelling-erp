'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

type Customer = { id: string; fullName: string };
type Departure = {
  id: string;
  startsAt: string;
  status: string;
  maxPax: number;
  reservedPax: number;
  remainingPax: number;
  occupancyPercent: number;
  surchargeAmount: string | number;
  surchargeBasis: 'PER_PAX' | 'PER_BOOKING';
  surchargeLabel?: string;
};
type Pack = { id: string; name: string; status: string; approvalStatus: string; adultPrice?: string; prices?: { sellingPrice: string }[]; departures?: Departure[] };
type Page<T> = { items: T[] };
const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function PosPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packId, setPackId] = useState('');
  const [departureId, setDepartureId] = useState('');
  const [pax, setPax] = useState(1);
  const [msg, setMsg] = useState('');

  const load = () => Promise.all([
    apiGet<Page<Customer>>('/customers?page=1&pageSize=100'),
    apiGet<Page<Pack>>('/packages?page=1&pageSize=100'),
  ]).then(([customersResult, packagesResult]) => {
    setCustomers(customersResult.items);
    setPacks(packagesResult.items.filter((item) => item.status === 'ACTIVE' && item.approvalStatus === 'APPROVED'));
  }).catch((error) => setMsg((error as Error).message));

  useEffect(() => { void load(); }, []);

  const pack = useMemo(() => packs.find((item) => item.id === packId), [packs, packId]);
  const departure = pack?.departures?.find((item) => item.id === departureId);
  const unit = Number(pack?.adultPrice ?? pack?.prices?.[0]?.sellingPrice ?? 0);
  const surcharge = departure ? Number(departure.surchargeAmount) * (departure.surchargeBasis === 'PER_PAX' ? pax : 1) : 0;
  const total = unit * pax + surcharge;
  const exceedsAvailability = Boolean(departure && pax > departure.remainingPax);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (exceedsAvailability) {
      setMsg('Jumlah peserta melebihi sisa kursi jadwal Open Trip.');
      return;
    }
    try {
      const paymentAmount = Number(data.get('paymentAmount') || 0);
      const booking = await apiPost<{ bookingCode: string; invoice: { id: string; invoiceNumber: string } }>('/bookings', {
        source: 'POS',
        customerId: data.get('customerId'),
        packageId: packId,
        departureId: departureId || undefined,
        packageName: pack?.name,
        travelDate: departure?.startsAt ?? data.get('travelDate'),
        pax,
        totalAmount: total,
        dueDate: data.get('dueDate') || undefined,
        notes: data.get('notes') || 'Transaksi POS',
      });
      if (paymentAmount > 0) await apiPost('/payments', {
        invoiceId: booking.invoice.id,
        amount: paymentAmount,
        method: data.get('paymentMethod'),
        reference: data.get('paymentReference') || undefined,
        notes: `Pembayaran POS untuk ${booking.bookingCode}`,
      });
      setMsg(`Transaksi ${booking.bookingCode} berhasil. Invoice ${booking.invoice.invoiceNumber}${paymentAmount > 0 ? ' dan pembayaran menunggu verifikasi.' : '.'}`);
      form.reset();
      setPackId('');
      setDepartureId('');
      setPax(1);
    } catch (error) {
      setMsg((error as Error).message);
    }
  }

  return <main className="modulePage posWorkspace">
    <div className="moduleHeading"><div><p>POINT OF SALE</p><h1>POS / Kasir</h1><span>Buat booking langsung dari counter dengan harga, surcharge, dan kapasitas yang divalidasi ulang oleh API.</span></div></div>
    {msg && <p className="moduleNotice">{msg}</p>}
    <div className="posGrid">
      <form className="moduleForm" onSubmit={submit}>
        <label>Customer<select name="customerId" required><option value="">Pilih customer</option>{customers.map((item) => <option value={item.id} key={item.id}>{item.fullName}</option>)}</select></label>
        <label>Paket<select value={packId} onChange={(event) => { setPackId(event.target.value); setDepartureId(''); }} required><option value="">Pilih paket</option>{packs.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label>Jadwal Open Trip<select value={departureId} onChange={(event) => setDepartureId(event.target.value)}><option value="">Private / fleksibel</option>{pack?.departures?.map((item) => {
          const closed = !['OPEN', 'SCHEDULED'].includes(item.status) || item.remainingPax <= 0;
          return <option key={item.id} value={item.id} disabled={closed}>{new Date(item.startsAt).toLocaleString('id-ID')} · {item.remainingPax} kursi · {item.status}</option>;
        })}</select></label>
        <label>Tanggal perjalanan<input name="travelDate" type="date" required={!departureId} disabled={Boolean(departureId)} /></label>
        <label>Jumlah peserta<input type="number" min="1" value={pax} onChange={(event) => setPax(Number(event.target.value))} /></label>
        <label>Jatuh tempo<input name="dueDate" type="date" /></label>
        {departure && <div className={departure.occupancyPercent >= 80 ? 'moduleNotice warning' : 'moduleNotice'} style={{ gridColumn: '1 / -1' }}>
          <strong>{departure.occupancyPercent >= 80 ? 'Kursi hampir penuh' : 'Ketersediaan jadwal'}</strong>
          <span>{departure.reservedPax}/{departure.maxPax} pax terisi · {departure.remainingPax} kursi tersisa</span>
          {exceedsAvailability && <b>Jumlah peserta melebihi sisa kursi.</b>}
        </div>}
        <label>Bayar sekarang<input name="paymentAmount" type="number" min="0" max={total} defaultValue="0" /></label>
        <label>Metode pembayaran<select name="paymentMethod"><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="QRIS">QRIS</option><option value="OTHER">Lainnya</option></select></label>
        <label>Referensi pembayaran<input name="paymentReference" /></label>
        <label>Catatan<textarea name="notes" /></label>
        <button className="primary" disabled={!packId || total <= 0 || exceedsAvailability}>Proses transaksi</button>
      </form>
      <aside className="posReceipt">
        <small>RINGKASAN TRANSAKSI</small><h2>{pack?.name || 'Pilih paket'}</h2>
        <dl><div><dt>Harga / pax</dt><dd>{money(unit)}</dd></div><div><dt>Peserta</dt><dd>{pax}</dd></div><div><dt>{departure?.surchargeLabel || 'Surcharge'}</dt><dd>{money(surcharge)}</dd></div><div><dt>Total</dt><dd>{money(total)}</dd></div></dl>
        <p>Invoice dibuat otomatis. Pembayaran tetap memerlukan verifikasi finance.</p>
      </aside>
    </div>
  </main>;
}
