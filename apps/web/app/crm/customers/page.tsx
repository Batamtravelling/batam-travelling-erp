'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost } from '../../../lib/api';

type Follow = { id: string; dueAt: string; channel: string; subject: string; status: string; notes?: string; nextAction?: string; customer?: { id: string; customerCode: string; fullName: string; phone?: string; email?: string }; lead?: { id: string; leadCode: string; senderName?: string; status: string }; assignedUser?: { id: string; name: string } };
type Lead = { id: string; leadCode: string; senderName?: string; phone?: string; email?: string; message?: string; source: string; estimatedValue?: string; priority: string; status: string; verifiedAt?: string; notes?: string; nextFollowUpAt?: string; updatedAt: string; customer?: { id: string; fullName: string }; followUps: Follow[] };
type Customer = { id: string; customerCode: string; fullName: string; phone?: string; email?: string; type: string; status: string; leadSource?: string; notes?: string; leads: { id: string; leadCode: string; status: string; estimatedValue?: string }[]; bookings: { id: string; totalAmount: string; status: string }[]; followUps: Follow[]; commercialActivity: { leadCount: number; bookingCount: number; activeBookingCount: number; lifetimeBookingValue: number } };
type PageResult<T> = { items: T[]; meta: { page: number; pageSize: number; total: number; totalPages: number } };

const statuses = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTATION', 'NEGOTIATION', 'WON', 'LOST'] as const;
const moves: Record<string, string[]> = { NEW: ['CONTACTED', 'LOST'], CONTACTED: ['QUALIFIED', 'LOST'], QUALIFIED: ['QUOTATION', 'LOST'], QUOTATION: ['NEGOTIATION', 'WON', 'LOST'], NEGOTIATION: ['WON', 'LOST'], WON: [], LOST: [] };
const money = (v: number | string = 0) => `Rp ${Number(v).toLocaleString('id-ID')}`;
const PAGE_SIZES = [6, 12, 24, 48];

function PaginationBar({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return <div className="paginationBar"><button type="button" onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</button><span>Page {page} of {totalPages}</span><button type="button" onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Next</button></div>;
}

export default function CrmCustomerPage() {
  const [view, setView] = useState<'customers' | 'pipeline' | 'followups'>('customers');
  const [customerPage, setCustomerPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);
  const [followPage, setFollowPage] = useState(1);
  const [customerPageSize, setCustomerPageSize] = useState(6);
  const [leadPageSize, setLeadPageSize] = useState(6);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<Follow[]>([]);
  const [customerMeta, setCustomerMeta] = useState({ page: 1, pageSize: 6, total: 0, totalPages: 1 });
  const [leadMeta, setLeadMeta] = useState({ page: 1, pageSize: 6, total: 0, totalPages: 1 });
  const [followMeta, setFollowMeta] = useState({ page: 1, pageSize: 6, total: 0, totalPages: 1 });
  const [q, setQ] = useState('');
  const [source, setSource] = useState('');
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState<string>();

  useEffect(() => {
    if (new URLSearchParams(location.search).get('view') === 'pipeline') setView('pipeline');
  }, []);

  const loadCustomers = async () => {
    const res = await apiGet<PageResult<Customer>>(`/customers?page=${customerPage}&pageSize=${customerPageSize}&search=${encodeURIComponent(q)}`);
    setCustomers(res.items);
    setCustomerMeta(res.meta);
    if (customerPage > res.meta.totalPages) setCustomerPage(res.meta.totalPages);
  };

  const loadLeads = async () => {
    const res = await apiGet<PageResult<Lead>>(`/leads?page=${leadPage}&pageSize=${leadPageSize}&search=${encodeURIComponent(q)}&source=${encodeURIComponent(source)}`);
    setLeads(res.items);
    setLeadMeta(res.meta);
    if (leadPage > res.meta.totalPages) setLeadPage(res.meta.totalPages);
  };

  const loadFollowUps = async () => {
    const res = await apiGet<PageResult<Follow>>(`/leads/follow-ups?page=${followPage}&pageSize=${leadPageSize}&search=${encodeURIComponent(q)}`);
    setFollowUps(res.items);
    setFollowMeta(res.meta);
    if (followPage > res.meta.totalPages) setFollowPage(res.meta.totalPages);
  };

  const load = async () => {
    try {
      await Promise.all([loadCustomers(), loadLeads(), loadFollowUps()]);
      setMsg('');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  useEffect(() => { load(); }, [customerPage, customerPageSize, leadPage, leadPageSize, followPage, q, source]);

  const activePipeline = leads.filter((x) => !['WON', 'LOST'].includes(x.status)).reduce((n, x) => n + Number(x.estimatedValue || 0), 0);
  const revenue = customers.reduce((n, c) => n + c.commercialActivity.lifetimeBookingValue, 0);

  async function createCustomer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await apiPost('/customers', {
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
      e.currentTarget.reset();
      await load();
      setMsg('Customer baru berhasil ditambahkan.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function intake(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await apiPost('/leads', {
        senderName: f.get('senderName'),
        phone: f.get('phone') || undefined,
        email: f.get('email') || undefined,
        source: f.get('source'),
        message: f.get('message'),
        requirement: f.get('message'),
        priority: f.get('priority'),
        estimatedValue: Number(f.get('estimatedValue')) || undefined,
        notes: f.get('notes') || undefined,
      });
      e.currentTarget.reset();
      await load();
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  async function follow(e: FormEvent<HTMLFormElement>, leadId: string) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await apiPost(`/leads/${leadId}/follow-ups`, {
      dueAt: f.get('dueAt'),
      channel: f.get('channel'),
      subject: f.get('subject'),
      notes: f.get('notes') || undefined,
      nextAction: f.get('nextAction') || undefined,
    });
    e.currentTarget.reset();
    await load();
  }

  return (
    <main className="modulePage unifiedCrm">
      <div className="moduleHeading">
        <div>
          <p>CRM CUSTOMER</p>
          <h1>Customer Relationship Center</h1>
          <span>Satu CRM untuk customer, pesan masuk, pipeline, follow-up, dan nilai transaksi.</span>
        </div>
      </div>

      <section className="crmStats">
        <article><b>{customerMeta.total}</b><span>Customer terverifikasi</span></article>
        <article><b>{leadMeta.total}</b><span>Pesan baru</span></article>
        <article><b>{money(activePipeline)}</b><span>Nilai pipeline</span></article>
        <article><b>{money(revenue)}</b><span>Nilai transaksi</span></article>
      </section>

      <nav className="crmMainTabs">
        <button className={view === 'customers' ? 'active' : ''} onClick={() => setView('customers')}>Customer Database</button>
        <button className={view === 'pipeline' ? 'active' : ''} onClick={() => setView('pipeline')}>Lead Pipeline</button>
        <button className={view === 'followups' ? 'active' : ''} onClick={() => setView('followups')}>Follow-up</button>
      </nav>

      {msg && <p className="errorText">{msg}</p>}

      {view === 'customers' && (
        <>
          <details className="leadInbox" open>
            <summary>+ Tambah Customer Baru</summary>
            <form onSubmit={createCustomer} className="customerInlineForm">
              <input name="fullName" placeholder="Nama customer" required />
              <select name="type">
                <option value="">Tipe customer</option>
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="FAMILY">FAMILY</option>
                <option value="GROUP">GROUP</option>
                <option value="CORPORATE">CORPORATE</option>
                <option value="AGENT">AGENT</option>
                <option value="RESELLER">RESELLER</option>
              </select>
              <input name="phone" placeholder="Nomor WhatsApp" />
              <input name="email" type="email" placeholder="Email" />
              <input name="city" placeholder="Kota" />
              <input name="country" maxLength={2} placeholder="Negara (ID/SG/MY)" defaultValue="ID" />
              <input name="address" className="full" placeholder="Alamat" />
              <textarea name="notes" className="full" placeholder="Catatan customer" />
              <button className="primary">Simpan Customer</button>
            </form>
          </details>

          <div className="customerSearch">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, telepon, atau email..." />
            <b>{customerMeta.total} customer</b>
            <select value={customerPageSize} onChange={(e) => setCustomerPageSize(Number(e.target.value))}>{PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / halaman</option>)}</select>
          </div>

          <section className="customerGrid detailed">
            {customers.map((c) => {
              const total = c.commercialActivity.lifetimeBookingValue;
              const pipe = c.leads.reduce((n, l) => n + Number(l.estimatedValue || 0), 0);
              const latest = c.followUps[0];
              return (
                <article key={c.id}>
                  <header>
                    <div>
                      <small>{c.customerCode} · {c.type} · {c.leadSource || 'MANUAL'}</small>
                      <h2>{c.fullName}</h2>
                      <p>{c.phone || '-'} · {c.email || '-'}</p>
                    </div>
                    <em>{c.status}</em>
                  </header>
                  <div className="customerMetrics">
                    <span><b>{c.leads.length}</b>Lead</span>
                    <span><b>{c.commercialActivity.activeBookingCount}</b>Booking aktif</span>
                    <span><b>{money(pipe)}</b>Pipeline</span>
                    <span><b>{money(total)}</b>Transaksi</span>
                  </div>
                  {latest && <div className="customerFollow"><b>Follow-up terakhir/berikutnya</b><span>{latest.subject} · {new Date(latest.dueAt).toLocaleString('id-ID')}</span><em>{latest.status}</em></div>}
                  <button className="customerDetailButton" onClick={() => setExpanded(expanded === c.id ? undefined : c.id)}>{expanded === c.id ? 'Tutup profil' : 'Lihat profil lengkap'}</button>
                  {expanded === c.id && (
                    <div className="customerProfile">
                      <section><h3>Lead history</h3>{c.leads.map((l) => <p key={l.id}><b>{l.leadCode}</b><span>{l.status} · {money(l.estimatedValue || 0)}</span></p>)}</section>
                      <section><h3>Booking history</h3>{c.bookings.map((b, i) => <p key={b.id}><b>Booking {i + 1}</b><span>{b.status} · {money(b.totalAmount)}</span></p>)}</section>
                      <section><h3>Catatan CRM</h3><p>{c.notes || 'Belum ada catatan customer.'}</p></section>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
          <PaginationBar page={customerMeta.page} totalPages={customerMeta.totalPages} onPage={setCustomerPage} />
        </>
      )}

      {view === 'pipeline' && (
        <>
          <details className="leadInbox">
            <summary>+ Catat pesan masuk sebagai Lead</summary>
            <form onSubmit={intake}>
              <input name="senderName" placeholder="Nama pengirim" required />
              <input name="phone" placeholder="WhatsApp/telepon" />
              <input name="email" type="email" placeholder="Email" />
              <select name="source">{['WHATSAPP', 'WEBSITE', 'INSTAGRAM', 'FACEBOOK', 'WALK_IN', 'REFERRAL', 'OTHER'].map((x) => <option key={x}>{x}</option>)}</select>
              <select name="priority">{['NORMAL', 'HIGH', 'URGENT', 'LOW'].map((x) => <option key={x}>{x}</option>)}</select>
              <input name="estimatedValue" type="number" min="0" placeholder="Estimasi nilai" />
              <textarea name="message" placeholder="Isi pesan/kebutuhan" required />
              <input name="notes" placeholder="Catatan internal" />
              <button className="primary">Masukkan ke pipeline</button>
            </form>
          </details>

          <div className="crmToolbar">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari lead..." />
            <select value={source} onChange={(e) => setSource(e.target.value)}><option value="">Semua sumber</option>{[...new Set(leads.map((x) => x.source))].map((x) => <option key={x}>{x}</option>)}</select>
            <select value={leadPageSize} onChange={(e) => setLeadPageSize(Number(e.target.value))}>{PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / halaman</option>)}</select>
            <b>{leadMeta.total} lead</b>
          </div>

          <section className="leadKanban">
            {statuses.map((s) => (
              <div className="leadColumn" key={s}>
                <header><b>{s}</b><span>{leads.filter((x) => x.status === s).length}</span></header>
                {leads.filter((x) => x.status === s).map((l) => (
                  <article className="leadCard" key={l.id}>
                    <div className="leadCardTop"><small>{l.leadCode} · {l.source}</small><em className={l.priority.toLowerCase()}>{l.priority}</em></div>
                    <h3>{l.customer?.fullName || l.senderName}</h3>
                    <p>{l.message}</p>
                    <span>{l.phone || l.email || '-'}</span>
                    <div className="leadValue"><b>{money(l.estimatedValue || 0)}</b><small>{l.verifiedAt ? 'Customer' : 'Belum diverifikasi'}</small></div>
                    <small className="leadMeta">Update terakhir: {new Date(l.updatedAt).toLocaleString('id-ID')}{l.nextFollowUpAt ? ` · Follow-up berikutnya ${new Date(l.nextFollowUpAt).toLocaleString('id-ID')}` : ''}</small>
                    <footer>
                      <select value="" onChange={async (e) => { if (!e.target.value) return; const reason = e.target.value === 'LOST' ? prompt('Alasan lost') || 'Tidak dilanjutkan' : undefined; await apiPost(`/leads/${l.id}/transition`, { status: e.target.value, reason }); await load(); }}>
                        <option value="">Pindah status...</option>
                        {moves[l.status].map((x) => <option key={x}>{x}</option>)}
                      </select>
                      <button type="button" onClick={() => setExpanded(expanded === l.id ? undefined : l.id)}>Detail</button>
                    </footer>
                    {expanded === l.id && (
                      <div className="leadDetail">
                        {!l.verifiedAt ? <button className="verifyButton" onClick={async () => { await apiPost(`/leads/${l.id}/verify`, { fullName: l.senderName, phone: l.phone, email: l.email, notes: l.notes }); await load(); }}>Verifikasi menjadi Customer</button> : <b className="verified">Customer terverifikasi</b>}
                        <label>Catatan<textarea defaultValue={l.notes} onBlur={async (e) => { await apiPatch(`/leads/${l.id}`, { notes: e.target.value }); await load(); }} /></label>
                        {l.verifiedAt && <form className="followForm" onSubmit={(e) => follow(e, l.id)}><input name="dueAt" type="datetime-local" required /><select name="channel">{['WHATSAPP', 'PHONE', 'EMAIL', 'MEETING'].map((x) => <option key={x}>{x}</option>)}</select><input name="subject" placeholder="Subjek follow-up" required /><input name="nextAction" placeholder="Tindakan berikutnya" /><input name="notes" placeholder="Catatan" /><button>Tambah follow-up</button></form>}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            ))}
          </section>
          <PaginationBar page={leadMeta.page} totalPages={leadMeta.totalPages} onPage={setLeadPage} />
        </>
      )}

      {view === 'followups' && (
        <section className="followUpWorkspace">
          <header><h2>Agenda Follow-up</h2><span>{followMeta.total} aktivitas tenant</span></header>
          <div className="crmToolbar"><input value={q} onChange={(e) => { setFollowPage(1); setQ(e.target.value); }} placeholder="Cari customer, subjek, atau tindakan..." /><b>{followMeta.total} follow-up</b><select value={leadPageSize} onChange={(e) => { setFollowPage(1); setLeadPageSize(Number(e.target.value)); }}>{PAGE_SIZES.map((n) => <option key={n} value={n}>{n} / halaman</option>)}</select></div>
          {followUps.map((f) => <article key={f.id} className={new Date(f.dueAt) < new Date() && !['COMPLETED', 'CANCELLED'].includes(f.status) ? 'overdue' : ''}><time>{new Date(f.dueAt).toLocaleString('id-ID')}</time><div><b>{f.subject}</b><span>{f.customer?.fullName || f.lead?.senderName || 'Customer'} · {f.channel}{f.assignedUser ? ` · PIC ${f.assignedUser.name}` : ''}</span><small>{f.notes || f.nextAction || 'Tanpa catatan'}</small></div><select value={f.status} onChange={async (e) => { await apiPatch(`/leads/follow-ups/${f.id}`, { status: e.target.value }); await loadFollowUps(); }}><option>PENDING</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select></article>)}
          {!followUps.length && <p>Belum ada follow-up untuk pencarian ini.</p>}
          <PaginationBar page={followMeta.page} totalPages={followMeta.totalPages} onPage={setFollowPage} />
        </section>
      )}
    </main>
  );
}
