'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '../../../lib/api';

type P = { id: string; name: string; kind: string; serviceLevel: string; destination?: string; durationDays: number; publicDescription?: string; included?: string; excluded?: string; meetingPoint?: string; importantInfo?: string; visitedDestinations?: string; packageDifferences?: string; promotionalLabel?: string; originalPrice?: string; specialPrice?: string; adultPrice?: string; childPrice?: string; infantPrice?: string; childAgePolicy?: string; infantAgePolicy?: string; gallery: { imageUrl: string }[]; itineraries: { dayNumber: number; time?: string; title: string; location?: string }[]; departures: { id: string; startsAt: string; maxPax: number }[]; prices: { sellingPrice: string }[] };

const money = (v?: string) => v ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v)) : 'Hubungi kami';
const list = (x?: string) => x?.split(/\r?\n|\s·\s/).filter(Boolean) || [];
const escapeHtml = (v: string) => v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const toPlainItinerary = (p: P) => {
  const destinations = list(p.visitedDestinations).join(', ');
  const itinerary = p.itineraries.map((x) => `DAY ${x.dayNumber} · ${x.time || 'Fleksibel'} · ${x.title}${x.location ? ` — ${x.location}` : ''}`).join('\n');
  return `PAKET / ITINERARY\n\nNama paket: ${p.name}\nJenis: ${p.kind}\nKelas: ${p.serviceLevel}\nDestinasi: ${p.destination || '-'}\nDurasi: ${p.durationDays} hari\nHarga: ${money(p.specialPrice || p.prices[0]?.sellingPrice)} / orang\n\nRingkasan:\n${p.packageDifferences || p.publicDescription || '-'}\n\nDestinasi yang dikunjungi:\n${destinations || '-'}\n\nSudah termasuk:\n${list(p.included).join('\n') || '-'}\n\nBelum termasuk:\n${list(p.excluded).join('\n') || '-'}\n\nRundown:\n${itinerary || '-'}\n\nMeeting point:\n${p.meetingPoint || '-'}\n\nInformasi penting:\n${p.importantInfo || '-'}\n`;
};

function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function printPackage(p: P) {
  const win = window.open('', '_blank', 'width=1100,height=1300');
  if (!win) return;
  const itineraryHtml = p.itineraries.map((x) => `<article class="day"><b>DAY ${x.dayNumber}</b><div><strong>${escapeHtml(x.title)}</strong><div>${escapeHtml(x.time || 'Fleksibel')}${x.location ? ` · ${escapeHtml(x.location)}` : ''}</div></div></article>`).join('');
  const destHtml = list(p.visitedDestinations).map((x) => `<span class="chip">⌖ ${escapeHtml(x)}</span>`).join('');
  win.document.write(`<!doctype html><html><head><title>${escapeHtml(p.name)}</title><style>body{font-family:var(--font-sans),ui-sans-serif,system-ui,sans-serif;padding:32px;line-height:1.5;color:#10223a}h1,h2,h3{margin:0 0 10px;font-weight:700;letter-spacing:-.02em}h2{margin-top:24px;font-size:18px}.muted{color:#607087}.hero{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;align-items:start}.box{border:1px solid #dbe3ee;border-radius:14px;padding:16px;background:#fff}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border:1px solid #cdd8e6;border-radius:999px;padding:6px 10px;font-size:12px}.itinerary{display:grid;gap:10px}.day{border:1px solid #dbe3ee;border-radius:12px;padding:12px;display:flex;justify-content:space-between;gap:10px}.images{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.images img{width:100%;height:220px;object-fit:cover;border-radius:12px;border:1px solid #dbe3ee}.action{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.action button{padding:10px 14px;border:0;border-radius:10px;background:#0d5fba;color:#fff;font-weight:700}@media print{button{display:none}}</style></head><body><div class="hero"><div>${p.gallery[0] ? `<img src="${p.gallery[0].imageUrl}" style="width:100%;max-height:420px;object-fit:cover;border-radius:18px;border:1px solid #dbe3ee"/>` : ''}</div><div><span class="muted">${escapeHtml(p.kind)} · ${escapeHtml(p.serviceLevel)}</span><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(p.publicDescription || p.packageDifferences || '')}</p><div class="box"><b>${money(p.specialPrice || p.prices[0]?.sellingPrice)}</b> / orang</div></div></div><h2>Destinasi yang dikunjungi</h2><div class="chips">${destHtml || '<span class="chip">Sesuai itinerary</span>'}</div><h2>Sudah termasuk</h2><div class="box">${list(p.included).map((x) => `✓ ${escapeHtml(x)}`).join('<br/>') || '-'}</div><h2>Belum termasuk</h2><div class="box">${list(p.excluded).map((x) => `× ${escapeHtml(x)}`).join('<br/>') || '-'}</div><h2>Rundown ringkas</h2><div class="itinerary">${itineraryHtml || '<div class="box">Rundown akan dikonfirmasi oleh tim sebelum keberangkatan.</div>'}</div><h2>Meeting point & informasi penting</h2><div class="box">${escapeHtml(p.meetingPoint || '-') }<br/><br/>${escapeHtml(p.importantInfo || '-')}</div><div class="action"><button onclick="window.print()">Print</button><button onclick="window.close()">Close</button></div><script>window.onload=()=>{window.print();}</script></body></html>`);
  win.document.close();
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<P>();
  const itineraryText = useMemo(() => (p ? toPlainItinerary(p) : ''), [p]);

  useEffect(() => {
    apiGet<P[]>('/public/packages').then((x) => setP(x.find((y) => y.id === id)));
  }, [id]);

  if (!p) return <main className="tripPublicPage"><p>Memuat detail paket...</p></main>;

  return <main className="tripPublicPage"><header className="tripPublicHero">{p.gallery[0] && <img src={p.gallery[0].imageUrl} alt={p.name} />}<div><span>{p.kind}</span>{p.promotionalLabel && <em>{p.promotionalLabel}</em>}<h1>{p.name}</h1><p>{p.publicDescription}</p><strong>{money(p.specialPrice || p.prices[0]?.sellingPrice)} / orang</strong>{p.originalPrice && <del>{money(p.originalPrice)}</del>}<div className="bookingActions"><button type="button" onClick={() => printPackage(p)}>Print Paket</button><button type="button" onClick={() => downloadText(`${p.name}.txt`, itineraryText)}>Download Itinerary</button><Link href={`/?package=${p.id}#trips`}>Lihat detail & booking</Link></div></div></header><nav className="tripPublicFacts"><span><b>{p.durationDays} hari</b>Durasi</span><span><b>{p.destination}</b>Tujuan</span><span><b>{p.departures.length}</b>Jadwal aktif</span><span><b>{p.serviceLevel}</b>Kelas paket</span></nav><section className="tripPublicContent"><article><h2>Ringkasan paket</h2><p>{p.packageDifferences || p.publicDescription}</p><h3>Destinasi yang dikunjungi</h3><div className="destinationChips">{list(p.visitedDestinations).map((x) => <span key={x}>⌖ {x}</span>)}</div></article><article className="tripPriceTable"><h2>Harga peserta</h2><p><span>Dewasa</span><b>{money(p.adultPrice || p.prices[0]?.sellingPrice)}</b></p><p><span>Anak {p.childAgePolicy}</span><b>{money(p.childPrice)}</b></p><p><span>Infant {p.infantAgePolicy}</span><b>{money(p.infantPrice)}</b></p></article><article><h2>Sudah termasuk</h2><ul>{list(p.included).map((x) => <li key={x}>{x}</li>)}</ul></article><article><h2>Belum termasuk</h2><ul>{list(p.excluded).map((x) => <li key={x}>{x}</li>)}</ul></article><article className="wide"><h2>Rundown ringkas</h2>{p.itineraries.map((x, n) => <p className="tripRun" key={n}><b>Hari {x.dayNumber} · {x.time || 'Fleksibel'}</b><span>{x.title} — {x.location}</span></p>)}</article><article className="wide"><h2>Meeting point & informasi</h2><p>{p.meetingPoint}</p><p>{p.importantInfo}</p></article></section><footer className="tripPublicFooter"><div><b>Batam Travelling</b><p>Paket perjalanan terencana dari Batam.</p></div><Link href="/contact">Kontak & WhatsApp</Link><Link href="/terms">Syarat & Ketentuan</Link></footer></main>;
}
