'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useRef, useState } from 'react';
import { apiPost } from '../lib/api';
import { money } from './public-ui';

type Price = { category: string; sellingPrice: number | string };
type Departure = { id:string; startsAt:string; maxPax:number; reservedPax:number; status?:string; surchargeAmount?:number|string; surchargeBasis?:string };
type Result = { customerCode:string; leadCode:string; bookingCode:string; invoiceNumber:string; totalAmount:number|string };
type Trip = { id:string; name:string; kind:string; minPax:number; maxPax:number; prices:Price[]; departures:Departure[] };

export function PublicBookingForm({trip}:{trip:Trip}) {
  const router=useRouter();
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [result,setResult]=useState<Result>(),[departureId,setDepartureId]=useState(''),[pax,setPax]=useState(Math.max(1,trip.minPax));
  const key=useRef<string | undefined>(undefined);
  const adultPrice=Number(trip.prices.find(x=>x.category==='ADULT')?.sellingPrice??trip.prices[0]?.sellingPrice??0);
  const departure=trip.departures.find(x=>x.id===departureId);
  const isOpenTrip=trip.departures.length>0;
  const seats=departure?Math.max(0,departure.maxPax-departure.reservedPax):trip.maxPax;
  const estimate=useMemo(()=>adultPrice*pax+Number(departure?.surchargeAmount??0)*(departure?.surchargeBasis==='PER_BOOKING'?1:pax),[adultPrice,departure,pax]);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');const data=new FormData(event.currentTarget);try{key.current||=crypto.randomUUID();setResult(await apiPost<Result>('/public/orders',{packageId:trip.id,departureId:departureId||undefined,fullName:data.get('fullName'),phone:data.get('phone'),email:data.get('email')||undefined,travelDate:departure?.startsAt.slice(0,10)??data.get('travelDate'),pax,notes:data.get('notes')||undefined,acceptedTerms:data.get('acceptedTerms')==='on',addons:[]},{'idempotency-key':key.current}));router.refresh();}catch(reason){setError((reason as Error).message||'Booking belum dapat diproses.');}finally{setBusy(false)}}
  if(result)return <section className="orderSuccess" aria-live="polite"><p>BOOKING BERHASIL</p><h2>{result.bookingCode}</h2><span>Invoice {result.invoiceNumber} · {money(result.totalAmount)}</span><Link href="/my-trip">Buka portal perjalanan</Link></section>;
  if(!open)return <button className="publicButton" type="button" disabled={adultPrice<=0} onClick={()=>setOpen(true)}>{adultPrice>0?'Lanjut booking':'Harga belum tersedia'}</button>;
  return <section className="detailBooking publicBookingInline"><button className="detailBack" type="button" onClick={()=>setOpen(false)}>← Kembali ke detail</button><header><small>BOOK YOUR JOURNEY</small><h2>{trip.name}</h2><p>Estimasi {money(estimate)}</p></header><form onSubmit={submit}>
    <label>Nama lengkap<input name="fullName" autoComplete="name" required maxLength={160}/></label><label>Nomor WhatsApp<input name="phone" type="tel" autoComplete="tel" placeholder="+62 812 3456 7890" required maxLength={40}/></label><label>Email<input name="email" type="email" autoComplete="email"/></label>
    {isOpenTrip?<label>Jadwal<select name="departureId" required value={departureId} onChange={event=>setDepartureId(event.target.value)}><option value="">Pilih jadwal Open Trip</option>{trip.departures.map(item=>{const remaining=Math.max(0,item.maxPax-item.reservedPax),unavailable=item.status!==undefined&&item.status!=='OPEN'||remaining<trip.minPax;return <option key={item.id} value={item.id} disabled={unavailable}>{new Date(item.startsAt).toLocaleDateString('id-ID',{dateStyle:'long'})} · {unavailable?(item.status==='OPEN'?`tidak cukup kursi (${remaining})`:'ditutup'):`${remaining} kursi`}</option>})}</select></label>:<label>Tanggal perjalanan<input name="travelDate" type="date" min={new Date().toISOString().slice(0,10)} required/></label>}
    <label>Jumlah peserta<input name="pax" type="number" min={trip.minPax} max={Math.min(trip.maxPax,seats)} value={pax} onChange={event=>setPax(Number(event.target.value))} required/></label><label>Catatan<textarea name="notes" maxLength={1000}/></label><label className="bookingTermsCheck"><input name="acceptedTerms" type="checkbox" required/><span>Saya menyetujui <Link href="/terms" target="_blank">Syarat & Ketentuan</Link>.</span></label><button className="publicButton" disabled={busy||(isOpenTrip&&!departureId)}>{busy?'Memproses…':'Konfirmasi booking'}</button>
  </form>{error&&<p className="orderError" role="alert">{error}</p>}</section>;
}
