import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicBookingForm } from '../../../components/public-booking-form';
import { money, PublicState } from '../../../components/public-ui';
import { publicApiGet } from '../../../lib/public-api';

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params;
  const result=await publicApiGet<any>(`/public/packages/${encodeURIComponent(id)}`);
  return result.ok?{title:result.data.name,description:result.data.publicDescription}:{title:'Paket tidak ditemukan'};
}

export default async function TripDetail({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const result=await publicApiGet<any>(`/public/packages/${encodeURIComponent(id)}`);
  if(!result.ok&&result.kind==='not-found')notFound();
  if(!result.ok)return <main className="publicPage"><PublicState kind="error" title="Detail paket belum dapat dimuat" description="Layanan katalog sedang terganggu."/></main>;
  const trip=result.data;
  const adult=trip.prices?.find((price:any)=>price.category==='ADULT')??trip.prices?.[0];
  return <main className="publicPage"><div className="publicPageInner">
    <section className="publicDetailHero"><div><span>{trip.departures?.length?'OPEN TRIP':'PRIVATE TRIP'} · {trip.packageCode}</span><h1>{trip.name}</h1><p>{trip.publicDescription}</p><PublicBookingForm trip={trip}/></div><aside className="publicDetailPrice"><small>Mulai dari</small><strong>{money(adult?.sellingPrice||0)}</strong><span>dewasa · {trip.durationDays} hari</span></aside></section>
    <div className="publicDetailSections">
      <section><h2>Harga peserta</h2>{trip.prices.map((price:any,index:number)=><div className="publicSchedule" key={price.category??price.type??index}><span>{price.category??price.type??'Harga paket'}</span><b>{money(price.sellingPrice)}</b></div>)}</section>
      <section><h2>Jadwal & kursi</h2>{trip.departures.length?trip.departures.map((departure:any)=><div className="publicSchedule" key={departure.id}><span>{new Date(departure.startsAt).toLocaleDateString('id-ID',{dateStyle:'long'})}<small>{departure.meetingPoint}</small></span><b>{departure.remainingPax} kursi</b>{Number(departure.surchargeAmount)>0&&<small>{departure.surchargeLabel}: {money(departure.surchargeAmount)} / peserta</small>}</div>):<p>Tanggal fleksibel dan dikonfirmasi bersama tim.</p>}</section>
      <section><h2>Sudah termasuk</h2><ul>{String(trip.included||'').split('\n').filter(Boolean).map((item:string)=><li key={item}>{item}</li>)}</ul></section>
      <section><h2>Belum termasuk</h2><ul>{String(trip.excluded||'').split('\n').filter(Boolean).map((item:string)=><li key={item}>{item}</li>)}</ul></section>
      <section className="wide"><h2>Itinerary</h2>{trip.itineraries.map((item:any,index:number)=><div className="publicItineraryRow" key={`${item.dayNumber}-${index}`}><b>Hari {item.dayNumber} · {item.time}</b><span>{item.title}<small>{item.location}</small></span></div>)}</section>
      <section className="wide"><h2>Informasi penting</h2><p>{trip.importantInfo}</p><p><b>Meeting point:</b> {trip.meetingPoint}</p></section>
    </div>
  </div></main>;
}
