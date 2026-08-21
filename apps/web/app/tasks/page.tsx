'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch, apiPost } from '../../lib/api';

type P = { id: string; name: string; milestones?: { id: string; title: string }[] };
type TripSummary = { id: string; tripCode: string; title: string; status: string };
type E = { id: string; name: string };
type Comment = { id: string; message: string; type: string; createdAt: string; author?: { name: string } };
type Participant = { id: string; role: string; user: E };
type T = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  startDate?: string;
  dueDate?: string;
  completedAt?: string;
  updatedAt: string;
  project?: P | null;
  trip?: TripSummary | null;
  assignee?: E;
  milestone?: { id: string; title: string };
  participants?: Participant[];
  comments?: Comment[];
};
type PageResult<T> = { items: T[] };
type Me = { permissions: string[] };

const statuses = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'] as const;
const labels: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', BLOCKED: 'Blocked', DONE: 'Done' };
const statusTone: Record<string, string> = { TODO: 'neutral', IN_PROGRESS: 'blue', BLOCKED: 'amber', DONE: 'green' };
const fmt = (d?: string) => (d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-');
const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : 'Tanpa tenggat');
const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function taskDoc(task: T) {
  const participants = task.participants?.map((x) => `- ${x.user.name} (${x.role})`).join('\n') || '-';
  const comments = task.comments?.map((x) => `- ${x.author?.name || 'System'}: ${x.message} (${fmt(x.createdAt)})`).join('\n') || '-';
  const parentLabel = task.project?.name ? `Proyek: ${task.project.name}` : task.trip ? `Trip: ${task.trip.tripCode} · ${task.trip.title}` : 'Operasional';
  return `TASK / TRIP SHEET\n\nJudul: ${task.title}\n${parentLabel}\nMilestone: ${task.milestone?.title || '-'}\nPIC utama: ${task.assignee?.name || '-'}\nPetugas:\n${participants}\n\nStatus: ${task.status}\nProgress: ${task.progress}%\nPrioritas: ${task.priority}\nMulai: ${fmt(task.startDate)}\nTenggat: ${fmt(task.dueDate)}\nSelesai: ${fmt(task.completedAt)}\nLast update: ${fmt(task.updatedAt)}\n\nDeskripsi:\n${task.description || '-'}\n\nCatatan terbaru:\n${comments}`;
}

function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function printTask(task: T) {
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) return;
  const parentText = task.project?.name ? `Proyek: ${escapeHtml(task.project.name)}` : task.trip ? `Trip: ${escapeHtml(task.trip.tripCode)} · ${escapeHtml(task.trip.title)}` : 'Operasional';
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(task.title)}</title><style>body{font-family:var(--font-sans),ui-sans-serif,system-ui,sans-serif;padding:32px;line-height:1.5;color:#10223a}h1{margin:0 0 10px;font-weight:700;letter-spacing:-.03em}h2{margin:22px 0 8px;font-size:16px;font-weight:700;letter-spacing:-.02em}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #dbe3ee;vertical-align:top}small{color:#607087}.meta{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:16px 0}.box{border:1px solid #dbe3ee;border-radius:12px;padding:14px}.muted{color:#607087}</style></head><body><h1>${escapeHtml(task.title)}</h1><div class="muted">${parentText} · PIC: ${escapeHtml(task.assignee?.name || '-')}</div><div class="meta"><div class="box"><b>Status</b><div>${escapeHtml(task.status)}</div></div><div class="box"><b>Progress</b><div>${task.progress}%</div></div><div class="box"><b>Tenggat</b><div>${escapeHtml(fmt(task.dueDate))}</div></div><div class="box"><b>Last update</b><div>${escapeHtml(fmt(task.updatedAt))}</div></div></div><h2>Deskripsi</h2><div class="box">${escapeHtml(task.description || '-').replaceAll('\\n','<br/>')}</div><h2>Petugas</h2><div class="box">${escapeHtml(task.participants?.map((x) => `${x.user.name} (${x.role})`).join(', ') || '-')}</div><h2>Catatan</h2><div class="box">${escapeHtml(task.comments?.map((x) => `${x.author?.name || 'System'}: ${x.message}`).join('\\n\\n') || '-').replaceAll('\\n','<br/>')}</div><script>window.onload=()=>{window.print();setTimeout(()=>window.close(),250)}</script></body></html>`);
  win.document.close();
}

function timeLabel(updatedAt: string, completedAt?: string) {
  if (completedAt) return `Selesai: ${fmt(completedAt)}`;
  return `Last update: ${fmt(updatedAt)}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<T[]>([]);
  const [projects, setProjects] = useState<P[]>([]);
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [employees, setEmployees] = useState<E[]>([]);
  const [view, setView] = useState<'kanban' | 'table' | 'calendar'>('kanban');
  const [filter, setFilter] = useState('');
  const [projectId, setProjectId] = useState('');
  const [targetType, setTargetType] = useState<'project' | 'trip'>('project');
  const [selectedTask, setSelectedTask] = useState('');
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const can = (permission: string) => permissions.includes(permission);

  const load = async () => {
    try {
      const [t, identity] = await Promise.all([
        apiGet<PageResult<T>>('/tasks?page=1&pageSize=100'),
        apiGet<Me>('/auth/me'),
      ]);
      const [p, e, tr] = await Promise.all([
        identity.permissions.includes('project.read') ? apiGet<PageResult<P>>('/projects?page=1&pageSize=100') : Promise.resolve({ items: [] }),
        identity.permissions.includes('employee.read') ? apiGet<PageResult<E>>('/employees?page=1&pageSize=100') : Promise.resolve({ items: [] }),
        identity.permissions.includes('trip.read') ? apiGet<PageResult<TripSummary>>('/trips?page=1&pageSize=100') : Promise.resolve({ items: [] }),
      ]);
      setTasks(t.items);
      setProjects(p.items);
      setEmployees(e.items);
      setTrips(tr.items);
      setPermissions(identity.permissions);
      if (!identity.permissions.includes('project.read') && identity.permissions.includes('trip.read')) setTargetType('trip');
      setMsg('');
    } catch (x) {
      setMsg((x as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => tasks.filter((t) => (!projectId || t.project?.id === projectId) && (!filter || t.title.toLowerCase().includes(filter.toLowerCase()))),
    [tasks, projectId, filter]
  );

  const selectedProject = projects.find((p) => p.id === projectId);
  const selectedTaskObj = visible.find((t) => t.id === selectedTask);
  const canCreate = can('task.create') && (can('project.read') || can('trip.read'));
  const effectiveTargetType = can(targetType === 'project' ? 'project.read' : 'trip.read') ? targetType : can('project.read') ? 'project' : 'trip';

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const chosenTarget = f.get('targetType') as string;
    const targetProjectId = chosenTarget === 'project' ? (String(f.get('projectId') || '') || undefined) : undefined;
    const targetTripId = chosenTarget === 'trip' ? (String(f.get('tripId') || '') || undefined) : undefined;
    if (!targetProjectId && !targetTripId) {
      setMsg('Pilih salah satu Proyek atau Trip operasional untuk tugas ini.');
      return;
    }
    try {
      await apiPost('/tasks', {
        title: f.get('title'),
        description: f.get('description') || undefined,
        projectId: targetProjectId,
        tripId: targetTripId,
        assigneeId: f.get('assigneeId') || undefined,
        participantIds: (f.getAll('participantIds') as string[]).filter(Boolean),
        milestoneId: targetProjectId ? (f.get('milestoneId') || undefined) : undefined,
        priority: f.get('priority'),
        startDate: f.get('startDate') || undefined,
        dueDate: f.get('dueDate') || undefined,
      });
      e.currentTarget.reset();
      await load();
      setMsg('Tugas baru berhasil disimpan.');
    } catch (x) {
      setMsg((x as Error).message);
    }
  }

  async function move(id: string, status: string, note?: string) {
    await apiPatch(`/tasks/${id}`, {
      status,
      progress: status === 'DONE' ? 100 : status === 'IN_PROGRESS' ? 50 : 0,
      comment: note || undefined,
    });
    await load();
  }

  async function submitComment(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTask || !comment.trim()) return;
    await apiPost(`/tasks/${selectedTask}/comments`, { message: comment, type: 'NOTE' });
    setComment('');
    await load();
  }

  const days = useMemo(() => {
    const map = new Map<string, T[]>();
    visible
      .filter((t) => t.dueDate)
      .forEach((t) => {
        const k = t.dueDate!.slice(0, 10);
        map.set(k, [...(map.get(k) || []), t]);
      });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [visible]);
  const summary = {
    total: visible.length,
    doing: visible.filter((t) => t.status === 'IN_PROGRESS').length,
    blocked: visible.filter((t) => t.status === 'BLOCKED').length,
    overdue: visible.filter((t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate).getTime() < Date.now()).length,
  };

  return (
    <main className="modulePage taskWorkspace">
      <div className="moduleHeading">
        <div>
          <p>WORK MANAGEMENT</p>
          <h1>Task Planner</h1>
          <span>Kelola pekerjaan dalam Kanban, tabel, atau kalender tenggat. Progress, last update, dan waktu selesai kini terlihat jelas.</span>
        </div>
        {can('project.read') && <Link href="/projects">← Project Portfolio</Link>}
      </div>

      {canCreate && <details className="createPanel">
        <summary>＋ Tambah tugas</summary>
        <form className="taskCreate moduleForm" onSubmit={create}>
          <input name="title" placeholder="Judul tugas" required />
          <input name="description" placeholder="Deskripsi/checklist ringkas" />

          <label>
            Target Tugas
            <select name="targetType" value={effectiveTargetType} onChange={(e) => setTargetType(e.target.value as 'project' | 'trip')}>
              {can('project.read') && <option value="project">Proyek Bisnis / Portofolio</option>}
              {can('trip.read') && <option value="trip">Trip Operasional</option>}
            </select>
          </label>

          {effectiveTargetType === 'project' ? (
            <>
              <select name="projectId" required onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Pilih proyek</option>
                {projects.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
              <select name="milestoneId">
                <option value="">Tanpa milestone</option>
                {selectedProject?.milestones?.map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <select name="tripId" required>
              <option value="">Pilih trip operasional</option>
              {trips.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.tripCode} · {x.title} ({x.status})
                </option>
              ))}
            </select>
          )}

          {can('employee.read') && <><label>
            PIC utama
            <select name="assigneeId">
              <option value="">Pilih PIC</option>
              {employees.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            PIC tambahan
            <select name="participantIds" multiple size={4}>
              {employees.map((x) => (
                <option value={x.id} key={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label></>}
          <select name="priority">
            <option>NORMAL</option>
            <option>LOW</option>
            <option>HIGH</option>
            <option>URGENT</option>
          </select>
          <label>
            Mulai
            <input name="startDate" type="date" />
          </label>
          <label>
            Tenggat
            <input name="dueDate" type="date" />
          </label>
          <button className="primary">Simpan tugas</button>
        </form>
      </details>}

      {msg && <p className="errorText">{msg}</p>}

      <div className="taskToolbar">
        <div className="viewTabs">
          {(['kanban', 'table', 'calendar'] as const).map((v) => (
            <button type="button" className={view === v ? 'active' : ''} key={v} onClick={() => setView(v)}>
              {v === 'kanban' ? '▦ Kanban' : v === 'table' ? '☷ Tabel' : '□ Kalender'}
            </button>
          ))}
        </div>
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Cari tugas..." />
        {can('project.read') && <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Semua proyek</option>
          {projects.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>}
        <b>{visible.length} tugas</b>
      </div>

      <section className="taskOverview">
        <article>
          <span>Total terlihat</span>
          <strong>{summary.total}</strong>
          <small>Hasil sesuai filter saat ini</small>
        </article>
        <article>
          <span>Berjalan</span>
          <strong>{summary.doing}</strong>
          <small>Masih aktif dikerjakan</small>
        </article>
        <article>
          <span>Blocked</span>
          <strong>{summary.blocked}</strong>
          <small>Butuh perhatian lebih cepat</small>
        </article>
        <article>
          <span>Terlambat</span>
          <strong>{summary.overdue}</strong>
          <small>Lewat tenggat namun belum selesai</small>
        </article>
      </section>

      {can('task.update') && <form className="moduleForm" onSubmit={submitComment}>
        <label>
          Pilih task
          <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)} required>
            <option value="">Pilih task untuk komentar</option>
            {visible.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Komentar / catatan
          <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Catatan progress, kendala, atau konfirmasi selesai" />
        </label>
        <button className="primary">Tambah catatan</button>
      </form>}

      {selectedTaskObj && (
        <section className="bookingTotal">
          <div>
            <span>Task dipilih</span>
            <strong>{selectedTaskObj.title}</strong>
            <small>{timeLabel(selectedTaskObj.updatedAt, selectedTaskObj.completedAt)}</small>
          </div>
          <div className="bookingActions">
            <button type="button" onClick={() => printTask(selectedTaskObj)}>Print Task</button>
            <button type="button" onClick={() => downloadText(`${selectedTaskObj.title}.txt`, taskDoc(selectedTaskObj))}>Download TXT</button>
          </div>
        </section>
      )}

      {view === 'kanban' && (
        <section className="kanbanBoard">
          {statuses.map((s) => (
            <div className={`kanbanColumn ${s.toLowerCase()}`} key={s}>
              <header>
                <b>{labels[s]}</b>
                <span>{visible.filter((t) => t.status === s).length}</span>
              </header>
              {visible
                .filter((t) => t.status === s)
                .map((t) => (
                  <article className="taskCard" key={t.id}>
                    <div className="taskCardTop">
                      <em className={`priority priority-${t.priority.toLowerCase()}`}>{t.priority}</em>
                      <span className={`taskStatus taskStatus-${statusTone[t.status] || 'neutral'}`}>{labels[t.status] || t.status}</span>
                    </div>
                    <h3>{t.title}</h3>
                    {t.description && <p>{t.description}</p>}
                    <div className="taskMetaGrid">
                      <span><b>Proyek/Trip</b><small>{t.project?.name ?? (t.trip ? `${t.trip.tripCode} · ${t.trip.title}` : 'Operasional')}</small></span>
                      <span><b>PIC</b><small>{t.assignee?.name || 'Belum ada PIC'}</small></span>
                      <span><b>Petugas</b><small>{t.participants?.length ?? 0} orang</small></span>
                      <span><b>Milestone</b><small>{t.milestone?.title || 'Tanpa milestone'}</small></span>
                      <span><b>Progress</b><small>{t.progress}%</small></span>
                      <span><b>Update</b><small>{timeLabel(t.updatedAt, t.completedAt)}</small></span>
                    </div>
                    {t.comments?.[0] && <div className="taskNote">Catatan terakhir: {t.comments[0].message}</div>}
                    <footer>
                      <small>{fmtDate(t.dueDate)}</small>
                      <div className="bookingActions">
                        <button type="button" onClick={() => printTask(t)}>Print</button>
                        <button type="button" onClick={() => downloadText(`${t.title}.txt`, taskDoc(t))}>Download</button>
                        {can('task.update') && <select value={t.status} onChange={(e) => move(t.id, e.target.value, `Status diubah ke ${e.target.value}`)}>
                          {statuses.map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>}
                      </div>
                    </footer>
                  </article>
                ))}
            </div>
          ))}
        </section>
      )}

      {view === 'table' && (
        <div className="dataTable taskTable">
          <div className="tableRow tableHead">
            <span>Tugas</span>
            <span>Proyek / Trip / Milestone</span>
            <span>PIC</span>
            <span>Petugas</span>
            <span>Progres</span>
            <span>Last Update</span>
            <span>Status</span>
          </div>
          {visible.map((t) => (
              <div className="tableRow" key={t.id}>
                <span>
                  <b>{t.title}</b>
                  <small>{fmtDate(t.dueDate)}</small>
                  <small>{t.project?.name ?? (t.trip ? `${t.trip.tripCode} · ${t.trip.title}` : 'Operasional')}</small>
                </span>
                <span>
                  {t.project?.name ?? (t.trip ? `${t.trip.tripCode} · ${t.trip.title}` : 'Operasional')}
                  <small>{t.milestone?.title || '-'}</small>
              </span>
              <span>{t.assignee?.name || '-'}</span>
              <span>{t.participants?.map((x) => x.user.name).join(', ') || '-'}</span>
              <span>
                {can('task.update') ? <input
                  className="progressInput"
                  type="number"
                  min="0"
                  max="100"
                  value={t.progress}
                  onChange={async (e) => {
                    await apiPatch(`/tasks/${t.id}`, { progress: Number(e.target.value) });
                    await load();
                  }}
                /> : t.progress}
                %
              </span>
              <span>
                <small>{timeLabel(t.updatedAt, t.completedAt)}</small>
              </span>
              <span>
                <span className={`taskStatus taskStatus-${statusTone[t.status] || 'neutral'}`}>{labels[t.status] || t.status}</span>
              </span>
              <div className="bookingActions">
                <button type="button" onClick={() => printTask(t)}>Print</button>
                <button type="button" onClick={() => downloadText(`${t.title}.txt`, taskDoc(t))}>Download</button>
                {can('task.update') && <select value={t.status} onChange={(e) => move(t.id, e.target.value, `Status diubah ke ${e.target.value}`)}>
                  {statuses.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <section className="calendarView">
          {days.length ? (
            days.map(([date, list]) => (
              <article key={date}>
                <header>
                  <strong>{new Date(date + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                  <span>{list.length} tugas</span>
                </header>
                {list.map((t) => (
                  <div key={t.id}>
                    <i className={t.priority.toLowerCase()} />
                    <span>
                      <b>{t.title}</b>
                      <small>
                        {t.project?.name ?? (t.trip ? `${t.trip.tripCode} · ${t.trip.title}` : 'Operasional')} · {t.assignee?.name || 'Belum ada PIC'}
                      </small>
                    </span>
                    <div className="bookingActions">
                      <button type="button" onClick={() => printTask(t)}>Print</button>
                      <button type="button" onClick={() => downloadText(`${t.title}.txt`, taskDoc(t))}>Download</button>
                      {can('task.update') && <select value={t.status} onChange={(e) => move(t.id, e.target.value, `Status diubah ke ${e.target.value}`)}>
                        {statuses.map((x) => (
                          <option key={x} value={x}>
                            {labels[x]}
                          </option>
                        ))}
                      </select>}
                    </div>
                  </div>
                ))}
              </article>
            ))
          ) : (
            <p className="emptyState">Belum ada tugas dengan tenggat.</p>
          )}
        </section>
      )}
    </main>
  );
}
