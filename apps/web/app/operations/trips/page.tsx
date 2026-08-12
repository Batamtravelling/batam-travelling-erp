'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../../../lib/api';
type Trip={id:string;tripCode:string;title:string;status:string;startsAt:string;endsAt:string;vehicle?:string;booking:{bookingCode:string;pax:number;customer:{fullName:string}};assignments:{id:string;role:string;employee:{name:string;jobTitle?:string}}[]};
export default function TripsPage(){
 const [rows,setRows]=useState<Trip[]>([]),[message,setMessage]=useState('');
 useEffect(()=>{apiGet<Trip[]>('/trips').then(setRows).catch(e=>setMessage((e as Error).message))},[]);
 return <main className="modulePage"><div className="moduleHeading"><div><p>OPERATIONS</p><h1>Trip & Assignment</h1><span>Jadwal operasional berasal langsung dari booking dan database trip.</span></div><b>{rows.length} trip</b></div>
 {message&&<p className="errorText">{message}</p>}<div className="dataTable"><div className="tableRow tableHead"><span>Trip</span><span>Customer</span><span>Jadwal</span><span>Tim & Status</span></div>
 {rows.map(x=><div className="tableRow" key={x.id}><span><b>{x.tripCode}</b><small>{x.title} · {x.booking.bookingCode}</small></span><span>{x.booking.customer.fullName}<small>{x.booking.pax} pax</small></span><span>{new Date(x.startsAt).toLocaleString('id-ID')}<small>s.d. {new Date(x.endsAt).toLocaleString('id-ID')}</small></span><span>{x.status}<small>{x.assignments.map(a=>`${a.employee.name} (${a.role})`).join(', ')||'Belum ada assignment'}</small></span></div>)}
 {!rows.length&&!message&&<p className="empty">Belum ada trip operasional.</p>}</div></main>
}