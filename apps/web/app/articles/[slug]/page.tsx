import Link from 'next/link';
import { notFound } from 'next/navigation';
import { publicApiErrorMessage, publicApiGet } from '../../../lib/public-api';

type Article = { slug:string; title:string; excerpt?:string; content:string; coverImage?:string; publishedAt:string; author?:{name?:string}; packages:{package:{id:string;name:string;destination?:string}}[] };

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,result=await publicApiGet<Article>(`/public/articles/${encodeURIComponent(slug)}`);if(!result.ok&&result.kind==='not-found')notFound();if(!result.ok)return <main className="hub"><article className="hubCard publicError" role="alert"><h1>Artikel belum dapat dimuat</h1><p>{publicApiErrorMessage(result)}</p><Link href="/articles">Kembali ke artikel</Link></article></main>;const article=result.data;
  return <main className="hub"><article className="hubCard" style={{maxWidth:900,margin:'0 auto'}}>{article.coverImage&&<img src={article.coverImage} alt={article.title}/>}<small>{article.author?.name??'Batam Travelling'} · {new Date(article.publishedAt).toLocaleDateString('id-ID')}</small><h1>{article.title}</h1>{article.excerpt&&<b>{article.excerpt}</b>}<div>{article.content.split(/\r?\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>{article.packages.length>0&&<section><h2>Paket terkait</h2>{article.packages.map(({package:p})=><Link className="hubBtn blue" href={`/?package=${p.id}#trips`} key={p.id}>{p.name}</Link>)}</section>}<Link href="/articles">← Semua artikel</Link></article></main>;
}
