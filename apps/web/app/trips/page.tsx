import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicHero, PublicState, TripCard } from '../../components/public-ui';
import { publicApiErrorMessage, publicApiGet } from '../../lib/public-api';
import { publicDemoEnabled } from '../../lib/public-demo-data';

export const metadata: Metadata = { title: 'Paket Trip', description: 'Katalog Open Trip dan Private Trip Batam Travelling.' };

export default async function TripsPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state } = await searchParams;
  const previewState = publicDemoEnabled ? state : undefined;
  const result = await publicApiGet<any[]>('/public/packages');
  const trips = result.ok ? result.data : [];
  return <main className="publicPage"><div className="publicPageInner">
    <PublicHero eyebrow="Katalog perjalanan" title="Temukan trip yang sesuai dengan cara Anda bepergian." description="Bandingkan Open Trip dan Private Trip, jadwal, kursi, itinerary, serta harga peserta." action={<><Link className="publicButton" href="/trips">Lihat Open Trip</Link><Link className="publicButton secondary" href="/contact">Rancang Private Trip</Link></>} />
    {previewState === 'loading' ? <PublicState kind="loading" title="Memuat paket" description="Menyiapkan jadwal, harga, dan ketersediaan terbaru." />
      : previewState === 'empty' ? <PublicState kind="empty" title="Belum ada paket dipublikasikan" description="Tim kami sedang menyiapkan perjalanan berikutnya." />
      : previewState === 'error' ? <PublicState kind="error" title="Paket belum dapat dimuat" description="Layanan katalog sedang terganggu." actionHref="/trips" actionLabel="Coba lagi" />
      : previewState === 'unauthorized' ? <PublicState kind="unauthorized" title="Akses diperlukan" description="Masuk atau verifikasi booking untuk melihat informasi perjalanan privat." actionHref="/sign-in" actionLabel="Masuk pelanggan" />
      : !result.ok ? <PublicState kind="error" title="Paket belum dapat dimuat" description={publicApiErrorMessage(result)} actionHref="/trips" actionLabel="Coba lagi" />
      : trips.length ? <div className="publicGrid">{trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}</div>
      : <PublicState kind="empty" title="Belum ada paket dipublikasikan" description="Tim kami sedang menyiapkan perjalanan berikutnya." actionHref="/contact" actionLabel="Hubungi tim" />}
  </div></main>;
}
