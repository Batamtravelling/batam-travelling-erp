'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
type P={whatsappNumber?:string;whatsappNumberSecondary?:string;contactEmail?:string;contactAddress?:string;contactHours?:string;instagramUrl?:string;facebookUrl?:string;tiktokUrl?:string;youtubeUrl?:string};
export default function ContactPage(){
  const[p,setP]=useState<P>({}),[error,setError]=useState('');
  useEffect(()=>{apiGet<P>('/public/company-profile').then(setP).catch(e=>setError((e as Error).message))},[]);
  const wa1=(p.whatsappNumber||'').replace(/\D/g,''),wa2=(p.whatsappNumberSecondary||'').replace(/\D/g,'');
  const whatsapp=[['WhatsApp Bisnis 1',wa1],['WhatsApp Bisnis 2',wa2]].filter(([,number])=>number);
  const socials=[['Instagram',p.instagramUrl],['Facebook',p.facebookUrl],['TikTok',p.tiktokUrl],['YouTube',p.youtubeUrl]].filter(([,url])=>Boolean(url)) as Array<[string,string]>;
  return <main className="contactPage"><section><span>HUBUNGI KAMI</span><h1>Mari rencanakan perjalanan Anda.</h1><p>Tim kami siap membantu paket reguler, private trip, open trip, dan perjalanan perusahaan.</p>{error&&<p className="errorText">Informasi kontak belum dapat dimuat.</p>}<div className="contactButtons">{whatsapp.map(([label,number])=><a className="contactWa" href={`https://wa.me/${number}?text=${encodeURIComponent('Halo Batam Travelling, saya ingin bertanya mengenai paket perjalanan.')}`} target="_blank" rel="noreferrer" key={number}>{label}</a>)}{!whatsapp.length&&!error&&<p>Nomor layanan sedang dikonfigurasi.</p>}</div></section><div className="contactCards"><article><h2>Email</h2><p>{p.contactEmail||'Belum dikonfigurasi'}</p></article><article><h2>Kantor</h2><p>{p.contactAddress||'Batam, Kepulauan Riau'}</p></article><article><h2>Jam Pelayanan</h2><p>{p.contactHours||'Belum dikonfigurasi'}</p></article><article><h2>Sosial Media</h2><p>{socials.map(([name,url])=>`${name}: ${url}`).join(' · ')||'Belum dikonfigurasi'}</p></article></div></main>;
}
