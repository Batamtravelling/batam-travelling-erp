import Link from 'next/link';
import { notFound } from 'next/navigation';

type Article = { slug:string; title:string; excerpt?:string; content:string; coverImage?:string; publishedAt:string; author?:{name?:string}; packages:{package:{id:string;name:string;destination?:string}}[] };

async function load(slug:string):Promise<Article|null>{
  const api=process.env.NEXT_PUBLIC_API_URL??'http://localhost:3000/api/v1';
  const response=await fetch(`${api}/public/articles/${encodeURIComponent(slug)}`,{next:{revalidate:120}});
  return response.ok?response.json():null;
}

export default async function ArticlePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,article=await load(slug);if(!article)notFound();
  return <main className="hub"><article className="hubCard" style={{maxWidth:900,margin:'0 auto'}}>{article.coverImage&&<img src={article.coverImage} alt={article.title}/>}<small>{article.author?.name??'Batam Travelling'} · {new Date(article.publishedAt).toLocaleDateString('id-ID')}</small><h1>{article.title}</h1>{article.excerpt&&<b>{article.excerpt}</b>}<div>{article.content.split(/\r?\n/).filter(Boolean).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>{article.packages.length>0&&<section><h2>Paket terkait</h2>{article.packages.map(({package:p})=><Link className="hubBtn blue" href={`/?package=${p.id}#trips`} key={p.id}>{p.name}</Link>)}</section>}<Link href="/articles">← Semua artikel</Link></article></main>;
}
