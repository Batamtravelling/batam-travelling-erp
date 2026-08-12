"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../lib/api';

interface PackageRow {
  id: string;
  packageCode: string;
  name: string;
  destination: string;
  durationDays: number;
  adultPrice?: number;
  prices?: { sellingPrice: number }[];
  status: string;
  departures?: {id:string;startsAt:string;maxPax:number;status:string;surchargeLabel?:string;surchargeAmount:number;surchargeBasis:string}[];
}

const emptyForm = {
  packageCode: '',
  name: '',
  destination: '',
  durationDays: '1',
  sellingPrice: '0',
  status: 'DRAFT',
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [schedule,setSchedule]=useState({packageId:'',startsAt:'',endsAt:'',bookingCloseAt:'',minPax:'1',maxPax:'25',meetingPoint:'',surchargeLabel:'',surchargeAmount:'0',surchargeBasis:'PER_PAX'});

  const fetchPackages = async () => {
    setLoading(true);
    try {
      setPackages(await apiGet<PackageRow[]>('/packages'));
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const createSchedule=async(event:React.FormEvent)=>{event.preventDefault();if(!schedule.packageId)return;await apiPost(`/packages/${schedule.packageId}/departures`,{startsAt:new Date(schedule.startsAt).toISOString(),endsAt:schedule.endsAt?new Date(schedule.endsAt).toISOString():undefined,bookingCloseAt:schedule.bookingCloseAt?new Date(schedule.bookingCloseAt).toISOString():undefined,minPax:Number(schedule.minPax),maxPax:Number(schedule.maxPax),meetingPoint:schedule.meetingPoint||undefined,status:'OPEN',surchargeLabel:schedule.surchargeLabel||undefined,surchargeAmount:Number(schedule.surchargeAmount),surchargeBasis:schedule.surchargeBasis});setMessage('Jadwal dan surcharge berhasil disimpan. Harga akan dihitung otomatis oleh API saat booking.');void fetchPackages()};

  useEffect(() => {
    void fetchPackages();
  }, []);

  const createPackage = async (event: React.FormEvent) => {
    event.preventDefault();
    await apiPost('/packages', {
        packageCode: form.packageCode,
        name: form.name,
        destination: form.destination,
        durationDays: Number(form.durationDays),
        sellingPrice: Number(form.sellingPrice),
        status: form.status,
      });
    setForm(emptyForm);
    setMessage('Paket berhasil disimpan dan tersedia untuk modul booking.');
    void fetchPackages();
  };

  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Packages</p>
              <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Travel packages</h1>
              <p style={{ margin: 0, color: '#64748b' }}>Kelola paket travel, harga, dan destinasi promosi.</p>
            </div>
          </div>

          <form onSubmit={createPackage} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '18px' }}>
            <input required value={form.packageCode} onChange={(event) => setForm({ ...form, packageCode: event.target.value })} placeholder="Kode paket" style={inputStyle} />
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama paket" style={inputStyle} />
            <input required value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="Destinasi" style={inputStyle} />
            <input required type="number" min="1" value={form.durationDays} onChange={(event) => setForm({ ...form, durationDays: event.target.value })} placeholder="Durasi hari" style={inputStyle} />
            <input required type="number" min="0" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} placeholder="Harga" style={inputStyle} />
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} style={inputStyle}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button type="submit" style={{ border: 0, borderRadius: '10px', background: '#0f766e', color: 'white', fontWeight: 700, padding: '12px 14px', cursor: 'pointer' }}>Tambah paket</button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ margin: 0, textTransform:'uppercase',letterSpacing:'.18em',fontSize:12,color:'#64748b' }}>Jadwal & Surcharge</p><h2>Atur biaya berdasarkan tanggal keberangkatan</h2><p style={{color:'#64748b'}}>Surcharge tidak mengubah harga dasar paket dan hanya diterapkan pada jadwal ini.</p>
          <form onSubmit={createSchedule} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
            <select required value={schedule.packageId} onChange={e=>setSchedule({...schedule,packageId:e.target.value})} style={inputStyle}><option value="">Pilih paket</option>{packages.map(p=><option value={p.id} key={p.id}>{p.packageCode} · {p.name}</option>)}</select>
            <label>Tanggal berangkat<input required type="datetime-local" value={schedule.startsAt} onChange={e=>setSchedule({...schedule,startsAt:e.target.value})} style={inputStyle}/></label>
            <label>Booking ditutup<input type="datetime-local" value={schedule.bookingCloseAt} onChange={e=>setSchedule({...schedule,bookingCloseAt:e.target.value})} style={inputStyle}/></label>
            <input required type="number" min="1" value={schedule.minPax} onChange={e=>setSchedule({...schedule,minPax:e.target.value})} placeholder="Minimum pax" style={inputStyle}/>
            <input required type="number" min="1" value={schedule.maxPax} onChange={e=>setSchedule({...schedule,maxPax:e.target.value})} placeholder="Maksimum pax" style={inputStyle}/>
            <input value={schedule.meetingPoint} onChange={e=>setSchedule({...schedule,meetingPoint:e.target.value})} placeholder="Meeting point" style={inputStyle}/>
            <input value={schedule.surchargeLabel} onChange={e=>setSchedule({...schedule,surchargeLabel:e.target.value})} placeholder="Nama surcharge (contoh: High Season)" style={inputStyle}/>
            <input type="number" min="0" value={schedule.surchargeAmount} onChange={e=>setSchedule({...schedule,surchargeAmount:e.target.value})} placeholder="Biaya surcharge" style={inputStyle}/>
            <select value={schedule.surchargeBasis} onChange={e=>setSchedule({...schedule,surchargeBasis:e.target.value})} style={inputStyle}><option value="PER_PAX">Per peserta</option><option value="PER_BOOKING">Per booking</option></select>
            <button type="submit" style={{border:0,borderRadius:10,background:'#0d5fba',color:'#fff',fontWeight:700,padding:'12px 14px'}}>Simpan jadwal</button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          {message && <p className="moduleNotice">{message}</p>}
          {loading ? <div>Memuat paket...</div> : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {packages.length === 0 ? <div style={{ color: '#64748b' }}>Belum ada paket.</div> : packages.map((pkg) => (
                <div key={pkg.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{pkg.name}</div>
                    <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{pkg.packageCode} • {pkg.destination} • {pkg.durationDays} hari</div>
                    {pkg.departures?.map(d=><small key={d.id} style={{display:'block',marginTop:6,color:'#475569'}}>{new Date(d.startsAt).toLocaleString('id-ID')} · {d.maxPax} pax{Number(d.surchargeAmount)>0?` · ${d.surchargeLabel||'Surcharge'} Rp ${Number(d.surchargeAmount).toLocaleString('id-ID')} ${d.surchargeBasis==='PER_PAX'?'/ pax':'/ booking'}`:''}</small>)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 700 }}>Rp {Number(pkg.prices?.[0]?.sellingPrice ?? pkg.adultPrice ?? 0).toLocaleString('id-ID')}</div>
                    <span style={{ padding: '6px 10px', borderRadius: '999px', background: pkg.status === 'ACTIVE' ? '#dcfce7' : pkg.status === 'ARCHIVED' ? '#fee2e2' : '#e0f2fe', color: pkg.status === 'ACTIVE' ? '#166534' : pkg.status === 'ARCHIVED' ? '#991b1b' : '#075985', fontWeight: 700 }}>{pkg.status}</span><Link href={`/packages/${pkg.id}/print`} target="_blank">Print Paket</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
};
