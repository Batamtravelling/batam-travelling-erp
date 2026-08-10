'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/api';

type Pack = { id: string; name: string; destination?: string; durationDays: number; kind?: string; serviceLevel?: string; promotionalLabel?: string; gallery: { imageUrl: string; caption?: string }[]; prices: { sellingPrice: string }[]; departures: { id: string; startsAt: string; status: string; maxPax: number; _count?: { bookings: number } }[] };
type Promo = { id: string; code: string; title: string; description?: string; discountType: string; discountValue: string; endsAt: string };

const money = (v?: string) => (v ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(v)) : 'Hubungi kami');

export function WebsiteHighlights({ onSelect }: { onSelect?: (id: string) => void }) {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useEffect(() => {
    Promise.all([apiGet<Pack[]>('/public/packages'), apiGet<Promo[]>('/public/promotions')]).then(([p, d]) => {
      setPacks(p);
      setPromos(d);
    }).catch(() => undefined);
  }, []);

  const openTrips = useMemo(() => packs.filter((p) => p.departures?.length).slice(0, 4), [packs]);
  const popular = useMemo(() => packs.slice(0, 4), [packs]);
  const flash = promos[0];
  const select = (id: string) => onSelect ? onSelect(id) : location.assign(`/?package=${id}#trips`);

  return (
    <>
      <section className="announcementBar">
        <b>📣 PENGUMUMAN</b>
        <span>Booking Open Trip dibuat lebih cepat, jelas, dan rapi untuk pelanggan.</span>
        <Link href="/sign-up">Daftar akun →</Link>
      </section>

      <section className="dealZone" id="flash-sale">
        <div className="flashPanel">
          <div>
            <span className="dealEyebrow">⚡ FLASH SALE</span>
            <h2>{flash?.title ?? 'Penawaran perjalanan minggu ini'}</h2>
            <p>{flash?.description ?? 'Promo khusus untuk paket pilihan. Hubungi tim kami untuk penawaran terbaik.'}</p>
            {flash ? <><strong>{flash.discountType === 'PERCENTAGE' ? `${flash.discountValue}% OFF` : `Potongan ${money(flash.discountValue)}`}</strong><small>Kode: {flash.code} · berakhir {new Date(flash.endsAt).toLocaleDateString('id-ID')}</small></> : <strong>Harga spesial segera hadir</strong>}
          </div>
          <Link href="/promotions">Ambil promo</Link>
        </div>
        <div className="promoPanel">
          <span className="dealEyebrow">PROMO KHUSUS</span>
          <h3>Trip lebih hemat, tetap nyaman</h3>
          <p>Paket, jadwal, dan promo berasal langsung dari sistem yang selalu diperbarui.</p>
          <Link href="/promotions">Semua promo →</Link>
        </div>
      </section>

      <section className="highlightSection scheduleSection" id="open-trips">
        <header>
          <div>
            <span className="dealEyebrow">JADWAL TERSEDIA</span>
            <h2>Open Trip terdekat</h2>
            <p>Pilih jadwal dan lihat fasilitas lengkap sebelum booking.</p>
          </div>
          <a href="#trips">Semua paket →</a>
        </header>
        <div className="scheduleCardGrid">
          {openTrips.length ? openTrips.map((p) => {
            const d = p.departures[0];
            const premium = (p.serviceLevel || p.kind || '').includes('PREMIUM');
            const remaining = Math.max(0, d.maxPax - (d._count?.bookings || 0));
            return (
              <button type="button" className={`scheduleCard ${premium ? 'premium' : 'regular'}`} key={p.id} onClick={() => select(p.id)}>
                <div className="scheduleThumb">
                  {p.gallery?.[0] ? <img src={p.gallery[0].imageUrl} alt={p.gallery[0].caption || p.name} /> : <span>BT</span>}
                  <div className="scheduleBadges">
                    <b>{premium ? '★ PREMIUM' : 'REGULER'}</b>
                    {p.promotionalLabel && <em>{p.promotionalLabel}</em>}
                  </div>
                  <time>
                    <strong>{new Date(d.startsAt).toLocaleDateString('id-ID', { day: '2-digit' })}</strong>
                    <span>{new Date(d.startsAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                  </time>
                </div>
                <div className="scheduleInfo">
                  <small>{p.durationDays} hari · {p.destination}</small>
                  <h3>{p.name}</h3>
                  <div>
                    <span>👥 Sisa {remaining} kursi</span>
                    <span>🕒 {new Date(d.startsAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                  </div>
                  <footer><strong>{money(p.prices[0]?.sellingPrice)}</strong><em>Lihat detail →</em></footer>
                </div>
              </button>
            );
          }) : <article className="emptyCompact"><div><h3>Jadwal baru segera dibuka</h3><p>Pantau pengumuman Open Trip berikutnya.</p></div></article>}
        </div>
      </section>

      <section className="highlightSection" id="popular">
        <header><div><span className="dealEyebrow">PALING DICARI</span><h2>Trip populer</h2></div></header>
        <div className="popularTiles">{popular.map((p, n) => <button type="button" onClick={() => select(p.id)} key={p.id}><i>{['🌆', '🏝️', '🛳️', '🌏'][n]}</i><span><small>{p.durationDays} hari · {p.destination}</small><b>{p.name}</b></span><em>{money(p.prices[0]?.sellingPrice)}</em></button>)}</div>
      </section>
    </>
  );
}
