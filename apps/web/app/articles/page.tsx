import Link from 'next/link';
import { publicApiErrorMessage, publicApiGet } from '../../lib/public-api';

type A = { slug: string; title: string; excerpt?: string; coverImage?: string; publishedAt: string; author?: { name?: string }; packages: { package: { name: string } }[] };

export default async function Page() {
  const result = await publicApiGet<A[]>('/public/articles');
  const articles = result.ok ? result.data : [];

  return (
    <main className="hub">
      <section className="hubHero">
        <span className="hubTag">Inspirasi Perjalanan</span>
        <h1>Artikel & Panduan Wisata</h1>
        <p>Temukan ide perjalanan, panduan praktis, dan paket yang dapat langsung dipesan.</p>
      </section>

      <div className="hubGrid">
        {!result.ok ? <article className="hubCard publicError" role="alert"><h2>Artikel belum dapat dimuat</h2><p>{publicApiErrorMessage(result)}</p><Link className="hubBtn blue" href="/articles">Coba lagi</Link></article> : articles.length ? (
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
