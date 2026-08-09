'use client';
import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '../lib/api';
type Customer = { id:string; customerCode:string; fullName:string; phone?:string; email?:string; status:string };
type Lead = { id:string; leadCode:string; source:string; destination?:string; pax?:number; priority:string; status:string; customer:Customer };
export function CrmList({ kind }: { kind:'customers'|'leads' }) {
  const [rows,setRows]=useState<Array<Customer|Lead>>([]); const [state,setState]=useState<'loading'|'ready'|'error'>('loading'); const [message,setMessage]=useState('');
  const load=useCallback(()=>{setState('loading');apiGet<Array<Customer|Lead>>(`/${kind}`).then(data=>{setRows(data);setState('ready')}).catch((error:Error)=>{setMessage(error.message);setState('error')})},[kind]);
  useEffect(()=>{load()},[load]);
  if(state==='loading')return <div className="stateBox" role="status"><div className="skeleton"/><div className="skeleton short"/>Memuat data...</div>;
  if(state==='error')return <div className="stateBox errorBox"><b>Data belum dapat dimuat.</b><p>{message}</p><button onClick={load}>Coba lagi</button></div>;
  if(!rows.length)return <div className="empty"><b>Belum ada data.</b><p>Buat data pertama setelah API dan database development berjalan.</p></div>;
  return <div className="tableWrap"><table><thead><tr>{kind==='customers'?<><th>Kode</th><th>Customer</th><th>Kontak</th><th>Status</th></>:<><th>Kode</th><th>Customer</th><th>Tujuan</th><th>Pax</th><th>Prioritas</th><th>Status</th></>}</tr></thead><tbody>{rows.map(row=>kind==='customers'?<tr key={row.id}><td>{(row as Customer).customerCode}</td><td><b>{(row as Customer).fullName}</b></td><td>{(row as Customer).phone||(row as Customer).email||'—'}</td><td><span className="badge">{(row as Customer).status}</span></td></tr>:<tr key={row.id}><td>{(row as Lead).leadCode}</td><td><b>{(row as Lead).customer.fullName}</b><small>{(row as Lead).source}</small></td><td>{(row as Lead).destination||'—'}</td><td>{(row as Lead).pax??'—'}</td><td>{(row as Lead).priority}</td><td><span className="badge">{(row as Lead).status}</span></td></tr>)}</tbody></table></div>;
}
