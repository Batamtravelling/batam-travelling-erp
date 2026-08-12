import Link from 'next/link';

type Promotion = {
  id: string; code: string; title: string; description?: string; discountType: string;
  discountValue: string; endsAt: string; bannerImage?: string; terms?: string;
  packages: { package: { id: string; name: string; destination?: string } }[];
};

async function load(): Promise<Promotion[]> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  const response = await fetch(`${api}/public/promotions`, { next: { revalidate: 120 } });
  return response.ok ? response.json() : [];
}

export default async function PromotionsPage() {
  const promotions = await load();
  return <main className="hub"><section className="hubHero"><span className="hubTag">PROMO RESMI</span><h1>Promo & Diskon Perjalanan</h1><p>Penawaran aktif Batam Travelling beserta masa berlaku dan ketentuannya.</p></section><div className="hubGrid">{promotions.map((promo) => <article className="hubCard" key={promo.id}>{promo.bannerImage && <img src={promo.bannerImage} alt={promo.title}/>}<small>{promo.code} · berlaku sampai {new Date(promo.endsAt).toLocaleDateString('id-ID')}</small><h2>{promo.title}</h2><p>{promo.description}</p><b>{promo.discountType === 'PERCENTAGE' ? `${Number(promo.discountValue)}%` : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(promo.discountValue))}</b>{promo.packages.map(({package:p}) => <Link className="hubBtn blue" href={`/?package=${p.id}#trips`} key={p.id}>{p.name}</Link>)}{promo.terms && <details><summary>Syarat promo</summary><p>{promo.terms}</p></details>}</article>)}{!promotions.length && <article className="hubCard"><h2>Belum ada promo aktif</h2><p>Promo yang sudah berakhir tidak ditampilkan. Lihat paket reguler yang tetap dapat dipesan.</p><Link className="hubBtn blue" href="/#trips">Lihat paket</Link></article>}</div></main>;
}
