import Link from 'next/link';

type A = { slug: string; title: string; excerpt?: string; coverImage?: string; publishedAt: string; author?: { name?: string }; packages: { package: { name: string } }[] };

async function loadArticles(): Promise<A[]> {
  const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
  try {
    const res = await fetch(`${api}/public/articles`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return (await res.json()) as A[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const articles = await loadArticles();

  return (
    <main className="hub">
      <section className="hubHero">
        <span className="hubTag">Inspirasi Perjalanan</span>
        <h1>Artikel & Panduan Wisata</h1>
        <p>Temukan ide perjalanan, panduan praktis, dan paket yang dapat langsung dipesan.</p>
      </section>

      <div className="hubGrid">
        {articles.length ? (
          articles.map((a) => (
            <article className="hubCard" key={a.slug}>
              {a.coverImage && <img src={a.coverImage} alt={a.title} />}
              <h2>{a.title}</h2>
              <p>{a.excerpt}</p>
              <small>
                {a.author?.name ?? 'Batam Travelling'} · {new Date(a.publishedAt).toLocaleDateString('id-ID')}
              </small>
              <p>{a.packages.length} paket terkait</p>
              <Link className="hubBtn blue" href={`/articles/${a.slug}`}>
                Baca artikel
              </Link>
            </article>
          ))
        ) : (
          <article className="hubCard">
            <h2>Artikel segera hadir</h2>
            <p>Tim sedang menyiapkan panduan perjalanan terbaik untuk Anda.</p>
          </article>
        )}
      </div>
    </main>
  );
}
