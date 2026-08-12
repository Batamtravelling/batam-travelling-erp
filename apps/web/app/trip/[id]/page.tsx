'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiGet } from '../../../lib/api';

type P = { id: string; name: string; kind: string; serviceLevel: string; destination?: string; durationDays: number; publicDescription?: string; included?: string; excluded?: string; meetingPoint?: string; importantInfo?: string; visitedDestinations?: string; packageDifferences?: string; promotionalLabel?: string; originalPrice?: string; specialPrice?: string; adultPrice?: string; childPrice?: string; infantPrice?: string; childAgePolicy?: string; infantAgePolicy?: string; gallery: { imageUrl: string }[]; itineraries: { dayNumber: number; time?: string; title: string; location?: string }[]; departures: { id: string; startsAt: string; maxPax: number }[]; prices: { sellingPrice: string }[] };

const money = (v?: string) => v ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v)) : 'Hubungi kami';
const list = (x?: string) => x?.split(/\r?\n|\s·\s/).filter(Boolean) || [];
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

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [p, setP] = useState<P>();
  const [error, setError] = useState('');
  const itineraryText = useMemo(() => (p ? toPlainItinerary(p) : ''), [p]);

  useEffect(() => {
    apiGet<P>(`/public/packages/${id}`).then(setP).catch((reason) => setError((reason as Error).message));
  }, [id]);

  if (error) return <main className="tripPublicPage"><p className="errorText">Detail paket gagal dimuat: {error}</p><button type="button" onClick={() => location.reload()}>Coba lagi</button></main>;
  if (!p) return <main className="tripPublicPage"><p>Memuat detail paket...</p></main>;

  return <main className="tripPublicPage"><header className="tripPublicHero">{p.gallery[0] && <img src={p.gallery[0].imageUrl} alt={p.name} />}<div><span>{p.kind}</span>{p.promotionalLabel && <em>{p.promotionalLabel}</em>}<h1>{p.name}</h1><p>{p.publicDescription}</p><strong>{money(p.specialPrice || p.prices[0]?.sellingPrice)} / orang</strong>{p.originalPrice && <del>{money(p.originalPrice)}</del>}<div className="bookingActions"><Link href={`/packages/${p.id}/print`} target="_blank" rel="noreferrer">Print / Simpan PDF</Link><button type="button" onClick={() => downloadText(`${p.name}.txt`, itineraryText)}>Download Itinerary</button><Link href={`/?package=${p.id}#trips`}>Lihat detail & booking</Link></div></div></header><nav className="tripPublicFacts"><span><b>{p.durationDays} hari</b>Durasi</span><span><b>{p.destination}</b>Tujuan</span><span><b>{p.departures.length}</b>Jadwal aktif</span><span><b>{p.serviceLevel}</b>Kelas paket</span></nav><section className="tripPublicContent"><article><h2>Ringkasan paket</h2><p>{p.packageDifferences || p.publicDescription}</p><h3>Destinasi yang dikunjungi</h3><div className="destinationChips">{list(p.visitedDestinations).map((x) => <span key={x}>⌖ {x}</span>)}</div></article><article className="tripPriceTable"><h2>Harga peserta</h2><p><span>Dewasa</span><b>{money(p.adultPrice || p.prices[0]?.sellingPrice)}</b></p><p><span>Anak {p.childAgePolicy}</span><b>{money(p.childPrice)}</b></p><p><span>Infant {p.infantAgePolicy}</span><b>{money(p.infantPrice)}</b></p></article><article><h2>Sudah termasuk</h2><ul>{list(p.included).map((x) => <li key={x}>{x}</li>)}</ul></article><article><h2>Belum termasuk</h2><ul>{list(p.excluded).map((x) => <li key={x}>{x}</li>)}</ul></article><article className="wide"><h2>Rundown ringkas</h2>{p.itineraries.map((x, n) => <p className="tripRun" key={n}><b>Hari {x.dayNumber} · {x.time || 'Fleksibel'}</b><span>{x.title} — {x.location}</span></p>)}</article><article className="wide"><h2>Meeting point & informasi</h2><p>{p.meetingPoint}</p><p>{p.importantInfo}</p></article></section><footer className="tripPublicFooter"><div><b>Batam Travelling</b><p>Paket perjalanan terencana dari Batam.</p></div><Link href="/contact">Kontak & WhatsApp</Link><Link href="/terms">Syarat & Ketentuan</Link></footer></main>;
}
