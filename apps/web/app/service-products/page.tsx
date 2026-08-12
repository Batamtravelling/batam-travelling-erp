import Link from 'next/link';
import { publicApiErrorMessage, publicApiGet } from '../../lib/public-api';

type ServiceProduct = { id: string; productCode: string; name: string; category: string; description?: string; imageUrl?: string; price: string; unit: string; route?: string; duration?: string; featured: boolean };
const cash = (v: string) => `Rp ${Number(v).toLocaleString('id-ID')}`;

export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const selected = (await searchParams).category || 'ALL';
  const result = await publicApiGet<ServiceProduct[]>('/public/service-products');
  const rows = result.ok ? result.data : [];
  const categories = ['ALL', ...Array.from(new Set(rows.map((x) => x.category)))];
  const visibleRows = selected === 'ALL' ? rows : rows.filter((row) => row.category === selected);

  return (
    <main className="productAdmin">
      <header>
        <div>
          <span>PRODUCT & INVENTORY</span>
          <h1>Produk Layanan</h1>
          <p>Kelola tiket, atraksi, transportasi, makan, dokumentasi, dan service yang dapat dibeli mandiri atau ditambahkan ke paket.</p>
        </div>
        <strong>
          {rows.length}
          <small>produk</small>
        </strong>
      </header>

      <section className="productAdminGrid">
        <section className="productList" style={{ gridColumn: '1 / -1' }}>
          <nav>{categories.map((x) => <Link key={x} className={x === selected ? 'active' : ''} href={x === 'ALL' ? '/service-products' : `/service-products?category=${encodeURIComponent(x)}`}>{x}</Link>)}</nav>
          {!result.ok && <article className="publicError" role="alert"><span><b>Produk belum dapat dimuat</b><p>{publicApiErrorMessage(result)}</p></span></article>}
          {result.ok && visibleRows.map((x) => (
            <article key={x.id}>
              <div>
                {x.imageUrl ? <img src={x.imageUrl} alt={x.name} /> : <i>{x.category === 'TRANSPORT' ? '🚐' : '🎟'}</i>}
              </div>
              <span>
                <small>{x.productCode} · {x.category}</small>
                <b>{x.name}</b>
                <p>{x.description}</p>
                <em>{x.route || x.duration || 'Layanan sesuai konfirmasi'}</em>
              </span>
              <strong>
                {cash(x.price)}
                <small>/ {x.unit}</small>
              </strong>
              {x.featured && <em>POPULER</em>}
            </article>
          ))}
          {result.ok && !visibleRows.length && <p className="serviceEmpty">Belum ada produk aktif untuk kategori ini.</p>}
        </section>
      </section>

      <p style={{ marginTop: 16 }}>
        Lihat juga <Link href="/tickets">Tiket & Atraksi</Link> dan <Link href="/transportation">Transportasi</Link>.
      </p>
    </main>
  );
}
