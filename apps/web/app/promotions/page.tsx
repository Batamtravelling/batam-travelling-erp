import Link from 'next/link';
import { publicApiErrorMessage, publicApiGet } from '../../lib/public-api';

type Promotion = {
  id: string; code: string; title: string; description?: string; discountType: string;
  discountValue: string; endsAt: string; bannerImage?: string; terms?: string;
  packages: { package: { id: string; name: string; destination?: string } }[];
};

export default async function PromotionsPage() {
  const result = await publicApiGet<Promotion[]>('/public/promotions');
  const promotions = result.ok ? result.data : [];
  return <main className="hub"><section className="hubHero"><span className="hubTag">PROMO RESMI</span><h1>Promo & Diskon Perjalanan</h1><p>Penawaran aktif Batam Travelling beserta masa berlaku dan ketentuannya.</p></section><div className="hubGrid">{!result.ok&&<article className="hubCard publicError" role="alert"><h2>Promo belum dapat dimuat</h2><p>{publicApiErrorMessage(result)}</p><Link className="hubBtn blue" href="/promotions">Coba lagi</Link></article>}{result.ok&&promotions.map((promo) => <article className="hubCard" key={promo.id}>{promo.bannerImage && <img src={promo.bannerImage} alt={promo.title}/>}<small>{promo.code} · berlaku sampai {new Date(promo.endsAt).toLocaleDateString('id-ID')}</small><h2>{promo.title}</h2><p>{promo.description}</p><b>{promo.discountType === 'PERCENTAGE' ? `${Number(promo.discountValue)}%` : new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(promo.discountValue))}</b>{promo.packages.map(({package:p}) => <Link className="hubBtn blue" href={`/?package=${p.id}#trips`} key={p.id}>{p.name}</Link>)}{promo.terms && <details><summary>Syarat promo</summary><p>{promo.terms}</p></details>}</article>)}{result.ok&&!promotions.length && <article className="hubCard"><h2>Belum ada promo aktif</h2><p>Promo yang sudah berakhir tidak ditampilkan. Lihat paket reguler yang tetap dapat dipesan.</p><Link className="hubBtn blue" href="/#trips">Lihat paket</Link></article>}</div></main>;
}
