import Link from 'next/link';

type ServiceProduct = { id: string; productCode: string; name: string; category: string; description?: string; imageUrl?: string; price: string; unit: string; route?: string; duration?: string; featured: boolean };
const cash = (v: string) => `Rp ${Number(v).toLocaleString('id-ID')}`;

async function loadProducts(): Promise<ServiceProduct[]> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  try {
    const res = await fetch(`${api}/public/service-products`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return (await res.json()) as ServiceProduct[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const rows = await loadProducts();
  const categories = ['ALL', ...Array.from(new Set(rows.map((x) => x.category)))];

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
          <nav>{categories.map((x) => <button key={x} className={x === 'ALL' ? 'active' : ''} type="button">{x}</button>)}</nav>
          {rows.map((x) => (
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
          {!rows.length && <p className="serviceEmpty">Produk sedang disiapkan. Admin dapat menambahkannya dari modul Produk Layanan.</p>}
        </section>
      </section>

      <p style={{ marginTop: 16 }}>
        Lihat juga <Link href="/tickets">Tiket & Atraksi</Link> dan <Link href="/transportation">Transportasi</Link>.
      </p>
    </main>
  );
}
