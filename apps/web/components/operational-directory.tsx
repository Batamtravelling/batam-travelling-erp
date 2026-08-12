'use client';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

export function OperationalDirectory({title,description,endpoint}:{title:string;description:string;endpoint:string}){
  const [rows,setRows]=useState<Record<string,unknown>[]>([]),[error,setError]=useState('');
  useEffect(()=>{apiGet<Record<string,unknown>[]>(endpoint).then(setRows).catch(e=>setError((e as Error).message))},[endpoint]);
  const value=(row:Record<string,unknown>,keys:string[])=>keys.map(k=>row[k]).find(v=>typeof v==='string'||typeof v==='number');
  return <main className="modulePage"><div className="moduleHeading"><div><p>OPERATIONS</p><h1>{title}</h1><span>{description}</span></div><b>{rows.length} data</b></div>{error&&<p className="errorText">{error}</p>}<section className="workspaceCards">{rows.map((row,index)=><article key={String(row.id??index)}><small>{String(value(row,['status','category','jobTitle','tripCode','projectCode'])??'Aktif')}</small><h2>{String(value(row,['name','title','packageCode'])??'Tanpa nama')}</h2><p>{String(value(row,['destination','description','startsAt','email'])??'Detail tersedia di sistem.')}</p></article>)}{!rows.length&&!error&&<p className="empty">Belum ada data.</p>}</section></main>;
}
