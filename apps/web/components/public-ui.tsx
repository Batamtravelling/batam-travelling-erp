import Link from 'next/link';

export const money=(value:number|string)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(value));

export function PublicHero({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:React.ReactNode}){
  return <header className="publicPageHero"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p>{action&&<div className="publicHeroActions">{action}</div>}</header>;
}
export function PublicState({kind,title,description,actionHref='/trips',actionLabel='Lihat paket'}:{kind:'loading'|'empty'|'error'|'not-found'|'unauthorized';title:string;description:string;actionHref?:string;actionLabel?:string}){
  return <section className={`publicState ${kind}`} role={kind==='error'?'alert':'status'} aria-live="polite"><span aria-hidden="true">{kind==='error'?'!':kind==='not-found'?'404':'BT'}</span><h2>{title}</h2><p>{description}</p><Link className="publicButton secondary" href={actionHref}>{actionLabel}</Link></section>;
}
export function TripCard({trip}:{trip:any}){
  const price=trip.prices?.find((x:any)=>x.category==='ADULT')?.sellingPrice??trip.prices?.[0]?.sellingPrice??0;
  const seats=trip.departures?.[0]?.remainingPax??null;
  return <article className="publicProductCard"><div className="publicProductVisual"><span>{trip.departures?.length?'Open Trip':'Private Trip'}</span><b>{trip.destination}</b><small>{trip.durationDays} hari</small></div><div className="publicProductBody"><h2>{trip.name}</h2><p>{trip.publicDescription||trip.description}</p><div className="publicProductMeta"><span>Mulai <b>{money(price)}</b></span><span>{seats===null?'Tanggal fleksibel':`${seats} kursi tersisa`}</span></div><Link className="publicButton" href={`/trips/${trip.id}`}>Lanjut booking</Link></div></article>;
}
export function ServiceCard({item}:{item:any}){return <article className="publicServiceCard"><span>{item.category}</span><h2>{item.name}</h2><p>{item.description}</p><div><b>{money(item.price)}</b><small> / {item.unit}</small></div><Link className="publicButton secondary" href="/contact">Tanyakan ketersediaan</Link></article>}
