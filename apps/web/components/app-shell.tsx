'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/crm/customers', label: 'CRM Customer', icon: '👥' },
  { href: '/sales/quotations', label: 'Quotations', icon: '🧾' },
  { href: '/bookings', label: 'Bookings', icon: '🛳️' },
  { href: '/pos', label: 'POS / Kasir', icon: 'S' },
  { href: '/packages', label: 'Paket Trip', icon: '🎒' },
  { href: '/package-reviews', label: 'Review Paket', icon: 'R' },
  { href: '/service-products', label: 'Produk Layanan', icon: 'PL' },
  { href: '/operations/open-trips', label: 'Open Trip', icon: 'OT' },
  { href: '/operations/trips', label: 'Trip & Assignment', icon: '🧭' },
  { href: '/projects', label: 'Proyek', icon: 'P' },
  { href: '/tasks', label: 'Tugas', icon: 'T' },
  { href: '/employees', label: 'Karyawan', icon: 'K' },
  { href: '/vendors', label: 'Vendor', icon: 'V' },
  { href: '/finance/invoices', label: 'Finance & Invoice', icon: '💳' },
  { href: '/finance/cashflow', label: 'Arus Kas & Biaya', icon: 'CF' },
  { href: '/reports', label: 'Reports & Backup', icon: '📈' },
  { href: '/content', label: 'Content Studio', icon: 'C' },
  { href: '/media-library', label: 'Media Library', icon: 'M' },
  { href: '/asset-knowledge', label: 'Asset & Knowledge', icon: 'AK' },
  { href: '/archives', label: 'Arsip', icon: 'A' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [brand,setBrand]=useState<{websiteLogoUrl?:string;erpLogoUrl?:string;whatsappNumber?:string;whatsappNumberSecondary?:string;instagramUrl?:string;facebookUrl?:string;tiktokUrl?:string;youtubeUrl?:string}>({});
  const [access,setAccess]=useState<{permissions:string[];role:string}>({permissions:[],role:'Memuat akses...'});
  const [waIndex,setWaIndex]=useState(0);
  useEffect(()=>{apiGet<{permissions:string[];role:string}>('/auth/me').then(setAccess).catch(()=>setAccess({permissions:[],role:'Akses tidak tersedia'}));apiGet<typeof brand>('/public/company-profile').then(setBrand).catch(()=>undefined)},[]);
  useEffect(()=>{if(typeof window==='undefined')return;const saved=Number(localStorage.getItem('bt_whatsapp_rotation')||'0');if(Number.isFinite(saved))setWaIndex(saved)},[]);
  useEffect(()=>{if(pathname!=='/'||typeof location==='undefined')return;const id=new URLSearchParams(location.search).get('package');if(!id)return;apiGet<{id:string;name:string}>(`/public/packages/${id}`).then(target=>{let tries=0;const timer=setInterval(()=>{tries++;const cards=Array.from(document.querySelectorAll<HTMLElement>('.publicTrips article'));const card=cards.find(x=>x.querySelector('h3')?.textContent?.trim()===target.name);const button=card?.querySelector<HTMLButtonElement>('button');if(button){clearInterval(timer);button.click();history.replaceState(null,'',`${location.pathname}#trips`)}else if(tries>20)clearInterval(timer)},150)}).catch(()=>undefined)},[pathname]);
  const required:Record<string,string>={'/pos':'booking.manage','/employees':'employee.read','/projects':'project.read','/tasks':'task.read','/crm/customers':'customer.read','/packages':'package.read','/service-products':'package.read','/package-reviews':'package.read','/asset-knowledge':'knowledge.read','/media-library':'media.read','/vendors':'vendor.read','/finance/cashflow':'payment.read','/sales/quotations':'quotation.view','/bookings':'booking.read','/operations/trips':'trip.read','/operations/open-trips':'trip.read','/finance/invoices':'invoice.read','/reports':'dashboard.owner','/archives':'archive.read','/content':'content.read','/settings':'settings.read'};
  const permissionReady=access.role!=='Memuat akses...'&&access.role!=='Akses tidak tersedia';
  const menuItems=permissionReady
    ? navItems.filter(item=>!required[item.href]||access.permissions.includes(required[item.href]))
    : [];

  if(/^\/packages\/[^/]+\/print$/.test(pathname??''))return <>{children}</>;
  const publicPage=pathname==='/'||pathname?.startsWith('/trip/')||pathname?.startsWith('/articles')||pathname?.startsWith('/promotions')||pathname?.startsWith('/tickets')||pathname?.startsWith('/transportation')||pathname?.startsWith('/terms')||pathname?.startsWith('/contact')||pathname?.startsWith('/sign-')||pathname?.startsWith('/account')||pathname?.startsWith('/erp-sign-in');
  if(pathname?.startsWith('/my-trip'))return <>{children}</>;
  if(publicPage){const waNumbers=[brand.whatsappNumber,brand.whatsappNumberSecondary].map(x=>(x||'').replace(/\D/g,'')).filter(Boolean);const wa=waNumbers[waIndex%Math.max(waNumbers.length,1)]||'';const nextIndex=(waIndex+1)%Math.max(waNumbers.length,1);const nextWa=waNumbers[nextIndex]||wa;const waText=`Halo Batam Travelling, saya ingin bertanya mengenai paket perjalanan.`;const waHref=`https://wa.me/${wa}?text=${encodeURIComponent(waText)}`;const socials=[brand.instagramUrl&&['Instagram',brand.instagramUrl] as const,brand.facebookUrl&&['Facebook',brand.facebookUrl] as const,brand.tiktokUrl&&['TikTok',brand.tiktokUrl] as const,brand.youtubeUrl&&['YouTube',brand.youtubeUrl] as const].filter(Boolean) as Array<readonly[string,string]>;return <><nav className="websiteNav"><Link href="/" className="websiteBrand" aria-label="Batam Travelling Home">{brand.websiteLogoUrl?<img src={brand.websiteLogoUrl} alt="Batam Travelling"/>:<><i>BT</i><span>BATAM <b>TRAVELLING</b></span></>}</Link><div className="websiteLinks"><details className="tripNavMenu"><summary>Paket Trip <span>⌄</span></summary><div><Link href="/#trips"><b>Semua Paket</b><small>Wisata dan liburan pilihan</small></Link><Link href="/#open-trips"><b>Open Trip</b><small>Jadwal keberangkatan terdekat</small></Link><Link href="/#trips"><b>Reguler & Premium</b><small>Bandingkan harga dan fasilitas</small></Link></div></details><Link href="/promotions">Promo & Diskon</Link><details className="tripNavMenu"><summary>Tiket & Layanan <span>⌄</span></summary><div><Link href="/tickets"><b>Tiket & Atraksi</b><small>Ferry, jetski, snorkeling, dokumentasi</small></Link><Link href="/transportation"><b>Transportasi</b><small>Transfer dan sewa kendaraan</small></Link></div></details><Link href="/articles">Blog & Panduan</Link><Link href="/#about">About</Link><Link href="/contact">Kontak</Link>{socials.map(([name,url])=><a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>)}</div><details className="accountMenu"><summary aria-label="Akun Saya" title="Akun Saya">👤</summary><div><Link href="/account">Dashboard Akun</Link><Link href="/sign-in">Masuk</Link><Link href="/sign-up">Daftar Akun</Link><Link href="/erp-sign-in">Masuk ERP</Link><Link href="/my-trip">Cek Booking</Link></div></details></nav>{children}{wa&&<a className="floatingWhatsapp" href={waHref} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp" onClick={()=>{try{localStorage.setItem('bt_whatsapp_rotation',String(nextIndex))}catch{}}}>WA <span>{nextWa===wa?'Chat WhatsApp':'Nomor berganti'}</span></a>}</>}

  return (
    <div className="erpShell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--brand-canvas)', color: 'var(--brand-ink)' }}>
      <aside className="erpSidebar" style={{ width: '280px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', background: 'var(--brand-navy)', color: 'white', padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '18px', zIndex: 40 }}>
        <Link href="/dashboard" className="erpBrand">{brand.erpLogoUrl?<img src={brand.erpLogoUrl} alt="Batam Travelling ERP"/>:'BATAM TRAVELLING'}</Link>
        <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9fb3ca', fontWeight: 700 }}>Modul ERP</div>
        <nav className="erpNav" style={{ display: 'grid', gap: '6px' }}>
          {menuItems.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: active ? 'var(--brand-yellow)' : '#d9e4f2', background: active ? 'var(--brand-blue-soft)' : 'transparent', borderLeft: active ? '3px solid var(--brand-yellow)' : '3px solid transparent', borderRadius: '8px', padding: '10px 12px', fontWeight: 650, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', fontSize: '13px', color: '#94a3b8' }}>
          <div style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ color: '#ffd524', fontWeight: 700 }}>Tenant: Batam Travelling</div>
            <div>Role: {permissionReady ? access.role : 'Memuat akses...'}</div>
          </div>
          <div style={{ marginTop: '10px', display: 'grid', gap: '8px' }}>
            <Link href="/erp-sign-in" style={{ color: '#ffd524', textDecoration: 'none', fontWeight: 700 }}>Masuk ERP</Link>
            <Link href="/dashboard" style={{ color: '#d9e4f2', textDecoration: 'none' }}>Buka Dashboard</Link>
          </div>
        </div>
      </aside>
      <div className="erpMain" style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}
