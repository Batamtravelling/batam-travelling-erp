'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPost } from '../lib/api';

type Kind = 'employee' | 'project' | 'vendor';
type Row = Record<string, unknown> & { id?: string };
type Meta = { page: number; pageSize: number; total: number; totalPages: number };

function dateInput(value: unknown) {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

function optional(data: FormData, name: string) {
  const value = String(data.get(name) ?? '').trim();
  return value || undefined;
}

function bodyFor(kind: Kind, data: FormData) {
  if (kind === 'employee') return { name: optional(data, 'name'), email: optional(data, 'email'), phone: optional(data, 'phone'), jobTitle: optional(data, 'jobTitle') };
  if (kind === 'project') return { code: optional(data, 'code'), name: optional(data, 'name'), description: optional(data, 'description'), startDate: optional(data, 'startDate'), dueDate: optional(data, 'dueDate') };
  return { name: optional(data, 'name'), category: optional(data, 'category'), contactName: optional(data, 'contactName'), phone: optional(data, 'phone'), email: optional(data, 'email'), paymentTermsDays: Number(data.get('paymentTermsDays') || 0) };
}

function DirectoryFields({ kind, row }: { kind: Kind; row?: Row }) {
  return <>
    {kind === 'project' && <input name="code" required defaultValue={String(row?.code ?? '')} placeholder="Kode proyek" />}
    <input name="name" required defaultValue={String(row?.name ?? '')} placeholder={kind === 'employee' ? 'Nama karyawan' : kind === 'vendor' ? 'Nama vendor' : 'Nama proyek'} />
    {kind === 'employee' && <><input name="email" type="email" required defaultValue={String(row?.email ?? '')} placeholder="Email kerja" /><input name="phone" defaultValue={String(row?.phone ?? '')} placeholder="Nomor telepon" /><input name="jobTitle" defaultValue={String(row?.jobTitle ?? '')} placeholder="Jabatan" /></>}
    {kind === 'project' && <><input name="description" defaultValue={String(row?.description ?? '')} placeholder="Deskripsi" /><label>Mulai<input name="startDate" type="date" defaultValue={dateInput(row?.startDate)} /></label><label>Tenggat<input name="dueDate" type="date" defaultValue={dateInput(row?.dueDate)} /></label></>}
    {kind === 'vendor' && <><input name="category" required defaultValue={String(row?.category ?? '')} placeholder="Kategori: HOTEL/TRANSPORT/BOAT" /><input name="contactName" defaultValue={String(row?.contactName ?? '')} placeholder="Nama kontak" /><input name="phone" defaultValue={String(row?.phone ?? '')} placeholder="Telepon" /><input name="email" type="email" defaultValue={String(row?.email ?? '')} placeholder="Email" /><input name="paymentTermsDays" type="number" min="0" max="3650" defaultValue={Number(row?.paymentTermsDays ?? 0)} placeholder="Termin pembayaran (hari)" /></>}
  </>;
}

export function OperationalDirectory({ title, description, endpoint, createKind }: { title: string; description: string; endpoint: string; createKind?: Kind }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [meta, setMeta] = useState<Meta>({ page: 1, pageSize: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    const timer = setTimeout(() => {
      apiGet<{ items: Row[]; meta: Meta }>(`${endpoint}?page=${page}&pageSize=20&search=${encodeURIComponent(search)}`).then((result) => { setRows(result.items); setMeta(result.meta); setError(''); }).catch((reason) => setError((reason as Error).message));
    }, 250);
    return () => clearTimeout(timer);
  }, [endpoint, page, search, reload]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!createKind) return;
    const form = event.currentTarget;
    try { await apiPost(endpoint, bodyFor(createKind, new FormData(form))); form.reset(); setReload((value) => value + 1); setError(''); } catch (reason) { setError((reason as Error).message); }
  }

  async function update(event: FormEvent<HTMLFormElement>, row: Row) {
    event.preventDefault();
    if (!createKind || !row.id) return;
    try { await apiPatch(`${endpoint}/${row.id}`, bodyFor(createKind, new FormData(event.currentTarget))); setReload((value) => value + 1); setError(''); } catch (reason) { setError((reason as Error).message); }
  }

  const value = (row: Row, keys: string[]) => keys.map((key) => row[key]).find((candidate) => typeof candidate === 'string' || typeof candidate === 'number');
  return <main className="modulePage"><div className="moduleHeading"><div><p>OPERATIONS</p><h1>{title}</h1><span>{description}</span></div><b>{meta.total} data</b></div>{createKind && <details className="createPanel"><summary>＋ Tambah {title}</summary><form className="moduleForm" onSubmit={create}><DirectoryFields kind={createKind} /><button>Simpan</button></form></details>}<div className="crmToolbar"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Cari ${title.toLowerCase()}…`} /></div>{error && <p className="errorText">{error}</p>}<section className="workspaceCards">{rows.map((row, index) => <article key={String(row.id ?? index)}><small>{String(value(row, ['status', 'category', 'jobTitle', 'tripCode', 'projectCode']) ?? 'Aktif')}</small><h2>{String(value(row, ['name', 'title', 'packageCode']) ?? 'Tanpa nama')}</h2><p>{String(value(row, ['destination', 'description', 'startsAt', 'email']) ?? 'Detail tersedia di sistem.')}</p>{createKind && <details><summary>Edit data</summary><form className="moduleForm" onSubmit={(event) => void update(event, row)}><DirectoryFields kind={createKind} row={row} /><button>Simpan perubahan</button></form></details>}</article>)}{!rows.length && !error && <p className="empty">Belum ada data.</p>}</section><div className="paginationBar"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Sebelumnya</button><span>Halaman {meta.page} dari {meta.totalPages}</span><button disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)}>Berikutnya</button></div></main>;
}
