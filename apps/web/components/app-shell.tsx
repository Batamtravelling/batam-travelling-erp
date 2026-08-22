'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { apiGet } from '../lib/api';
import { demoProfile, publicDemoEnabled } from '../lib/public-demo-data';
const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'DB' },
    { href: '/crm/customers', label: 'CRM Customer', icon: 'CR' },
    { href: '/sales/quotations', label: 'Quotations', icon: 'QT' },
    { href: '/bookings', label: 'Bookings', icon: 'BK' },
    { href: '/pos', label: 'POS / Kasir', icon: 'S' },
    { href: '/packages', label: 'Paket Trip', icon: 'PK' },
    { href: '/package-reviews', label: 'Review Paket', icon: 'R' },
    { href: '/service-products', label: 'Produk Layanan', icon: 'PL' },
    { href: '/operations/open-trips', label: 'Open Trip', icon: 'OT' },
    { href: '/operations/trips', label: 'Trip & Assignment', icon: 'TR' },
    { href: '/projects', label: 'Proyek', icon: 'P' },
    { href: '/tasks', label: 'Tugas', icon: 'T' },
    { href: '/employees', label: 'Karyawan', icon: 'K' },
    { href: '/vendors', label: 'Vendor', icon: 'V' },
    { href: '/finance/invoices', label: 'Finance & Invoice', icon: 'FI' },
    { href: '/finance/cashflow', label: 'Arus Kas & Biaya', icon: 'CF' },
    { href: '/reports', label: 'Reports & Backup', icon: 'RP' },
    { href: '/content', label: 'Content Studio', icon: 'C' },
    { href: '/promotion-management', label: 'Promotion Management', icon: 'P' },
    { href: '/media-library', label: 'Media Library', icon: 'M' },
    { href: '/asset-knowledge', label: 'Asset & Knowledge', icon: 'AK' },
    { href: '/archives', label: 'Arsip', icon: 'A' },
    { href: '/settings', label: 'Settings', icon: 'ST' },
];
const navGroups = [
    { label: 'Utama', paths: ['/dashboard'] },
    { label: 'Penjualan', paths: ['/crm/customers', '/sales/quotations', '/bookings', '/pos'] },
    { label: 'Produk & Operasi', paths: ['/packages', '/package-reviews', '/service-products', '/operations/open-trips', '/operations/trips'] },
    { label: 'Tim & Mitra', paths: ['/projects', '/tasks', '/employees', '/vendors'] },
    { label: 'Finance & Insight', paths: ['/finance/invoices', '/finance/cashflow', '/reports'] },
    { label: 'Konten & Sistem', paths: ['/content', '/promotion-management', '/media-library', '/asset-knowledge', '/archives', '/settings'] },
];
export function AppShell({ children }: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [brand, setBrand] = useState<{
        websiteLogoUrl?: string;
        erpLogoUrl?: string;
        whatsappNumber?: string;
        whatsappNumberSecondary?: string;
        instagramUrl?: string;
        facebookUrl?: string;
        tiktokUrl?: string;
        youtubeUrl?: string;
    }>({});
    const [access, setAccess] = useState<{
        permissions: string[];
        role: string;
    }>({ permissions: [], role: '' });
    const [accessState, setAccessState] = useState<'loading' | 'authenticated' | 'unauthorized' | 'error'>('loading');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [publicMenuOpen, setPublicMenuOpen] = useState(false);
    const drawerRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const publicDrawerRef = useRef<HTMLElement>(null);
    const publicMenuButtonRef = useRef<HTMLButtonElement>(null);
    const [waIndex, setWaIndex] = useState(0);
    useEffect(() => { apiGet<{
        permissions: string[];
        role: string;
    }>('/auth/me').then(value => { setAccess(value); setAccessState('authenticated'); }).catch((error: unknown) => { const message = error instanceof Error ? error.message : ''; setAccess({ permissions: [], role: '' }); setAccessState(/API error (401|403)/.test(message) ? 'unauthorized' : 'error'); }); if (publicDemoEnabled) setBrand(demoProfile); else apiGet<typeof brand | null>('/public/company-profile').then(value => setBrand(value ?? {})).catch(() => undefined); }, []);
    useEffect(() => { if (typeof window === 'undefined')
        return; const saved = Number(localStorage.getItem('bt_whatsapp_rotation') || '0'); if (Number.isFinite(saved))
        setWaIndex(saved); }, []);
    useEffect(() => { if (pathname !== '/' || typeof location === 'undefined')
        return; const id = new URLSearchParams(location.search).get('package'); if (!id)
        return; apiGet<{
        id: string;
        name: string;
    }>(`/public/packages/${id}`).then(target => { let tries = 0; const timer = setInterval(() => { tries++; const cards = Array.from(document.querySelectorAll<HTMLElement>('.publicTrips article')); const card = cards.find(x => x.querySelector('h3')?.textContent?.trim() === target.name); const button = card?.querySelector<HTMLButtonElement>('button'); if (button) {
        clearInterval(timer);
        button.click();
        history.replaceState(null, '', `${location.pathname}#trips`);
    }
    else if (tries > 20)
        clearInterval(timer); }, 150); }).catch(() => undefined); }, [pathname]);
    const required: Record<string, string> = { '/pos': 'booking.manage', '/employees': 'employee.read', '/projects': 'project.read', '/tasks': 'task.read', '/crm/customers': 'customer.read', '/packages': 'package.read', '/service-products': 'package.read', '/package-reviews': 'package.read', '/asset-knowledge': 'knowledge.read', '/media-library': 'media.read', '/vendors': 'vendor.read', '/finance/cashflow': 'payment.read', '/sales/quotations': 'quotation.view', '/bookings': 'booking.read', '/operations/trips': 'trip.read', '/operations/open-trips': 'trip.read', '/finance/invoices': 'invoice.read', '/reports': 'dashboard.owner', '/archives': 'archive.read', '/content': 'content.read', '/promotion-management': 'content.read', '/settings': 'settings.read' };
    const permissionReady = accessState === 'authenticated';
    const menuItems = permissionReady
        ? navItems.filter(item => !required[item.href] || access.permissions.includes(required[item.href]))
        : [];
    const groupedMenu = navGroups.map(group => ({ ...group, items: group.paths.map(path => menuItems.find(item => item.href === path)).filter((item): item is (typeof navItems)[number] => Boolean(item)) })).filter(group => group.items.length);
    const currentNavItem = navItems.find(item => pathname?.startsWith(item.href));
    useEffect(() => { setDrawerOpen(false); setPublicMenuOpen(false); }, [pathname]);
    useEffect(() => { if (!drawerOpen)
        return; const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; const drawer = drawerRef.current; const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])') ?? []); focusable()[0]?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
        return;
    } if (event.key !== 'Tab')
        return; const items = focusable(); if (!items.length)
        return; const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    } }; document.addEventListener('keydown', onKey); return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); }; }, [drawerOpen]);
    useEffect(() => { if (!publicMenuOpen)
        return; const previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; const drawer = publicDrawerRef.current; const focusable = () => Array.from(drawer?.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),summary,[tabindex]:not([tabindex="-1"])') ?? []); focusable()[0]?.focus(); const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') {
        setPublicMenuOpen(false);
        publicMenuButtonRef.current?.focus();
        return;
    } if (event.key !== 'Tab')
        return; const items = focusable(); if (!items.length)
        return; const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }
    else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    } }; document.addEventListener('keydown', onKey); return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); }; }, [publicMenuOpen]);
    if (/^\/packages\/[^/]+\/print$/.test(pathname ?? ''))
        return <>{children}</>;
    const publicPage = pathname === '/' || pathname?.startsWith('/trips') || pathname?.startsWith('/articles') || pathname?.startsWith('/promotions') || pathname?.startsWith('/tickets') || pathname?.startsWith('/transportation') || pathname?.startsWith('/terms') || pathname?.startsWith('/contact') || pathname?.startsWith('/sign-') || pathname?.startsWith('/account') || pathname?.startsWith('/erp-sign-in');
    if (pathname?.startsWith('/my-trip'))
        return <>{children}</>;
    if (publicPage) {
        const waNumbers = [brand.whatsappNumber, brand.whatsappNumberSecondary].map(x => (x || '').replace(/\D/g, '')).filter(Boolean);
        const wa = waNumbers[waIndex % Math.max(waNumbers.length, 1)] || '';
        const nextIndex = (waIndex + 1) % Math.max(waNumbers.length, 1);
        const nextWa = waNumbers[nextIndex] || wa;
        const waText = `Halo Batam Travelling, saya ingin bertanya mengenai paket perjalanan.`;
        const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(waText)}`;
        const socials = [brand.instagramUrl && ['Instagram', brand.instagramUrl] as const, brand.facebookUrl && ['Facebook', brand.facebookUrl] as const, brand.tiktokUrl && ['TikTok', brand.tiktokUrl] as const, brand.youtubeUrl && ['YouTube', brand.youtubeUrl] as const].filter(Boolean) as Array<readonly [
            string,
            string
        ]>;
        const publicNavigation = <><Link href="/trips">Paket Trip</Link><Link href="/trips">Open Trip</Link><Link href="/promotions">Promo & Diskon</Link><Link href="/tickets">Tiket & Atraksi</Link><Link href="/transportation">Transportasi</Link><Link href="/articles">Blog & Panduan</Link><Link href="/#about">Tentang Kami</Link><Link href="/contact">Kontak</Link>{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>)}<div className="websiteMobileAccount"><b>Akun Pelanggan</b><Link href="/account">Perjalanan Saya</Link><Link href="/sign-in">Masuk</Link><Link href="/sign-up">Daftar Akun</Link><Link href="/my-trip">Cek Booking</Link></div></>;
        return <><nav className="websiteNav"><Link href="/" className="websiteBrand" aria-label="Batam Travelling Home">{brand.websiteLogoUrl ? <img src={brand.websiteLogoUrl} alt="Batam Travelling"/> : <span>BATAM <b>TRAVELLING</b></span>}</Link><div className="websiteLinks"><details className="tripNavMenu"><summary>Paket Trip <span aria-hidden="true">v</span></summary><div><Link href="/trips"><b>Semua Paket</b><small>Wisata dan liburan pilihan</small></Link><Link href="/trips"><b>Open Trip</b><small>Jadwal keberangkatan terdekat</small></Link><Link href="/trips"><b>Private Trip</b><small>Perjalanan fleksibel untuk grup Anda</small></Link></div></details><Link href="/promotions">Promo & Diskon</Link><details className="tripNavMenu"><summary>Tiket & Layanan <span aria-hidden="true">v</span></summary><div><Link href="/tickets"><b>Tiket & Atraksi</b><small>Ferry, atraksi, dan aktivitas</small></Link><Link href="/transportation"><b>Transportasi</b><small>Transfer dan sewa kendaraan</small></Link></div></details><Link href="/articles">Blog & Panduan</Link><Link href="/#about">Tentang Kami</Link><Link href="/contact">Kontak</Link>{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noreferrer">{name}</a>)}</div><details className="accountMenu"><summary aria-label="Akun Saya" title="Akun Saya">Akun</summary><div><Link href="/account">Perjalanan Saya</Link><Link href="/sign-in">Masuk</Link><Link href="/sign-up">Daftar Akun</Link><Link href="/my-trip">Cek Booking</Link></div></details><button ref={publicMenuButtonRef} className="websiteMenuButton" type="button" aria-label="Buka navigasi website" aria-expanded={publicMenuOpen} aria-controls="website-mobile-navigation" onClick={() => setPublicMenuOpen(true)}>Menu</button></nav>{publicMenuOpen && <button className="websiteMenuOverlay" type="button" aria-label="Tutup navigasi website" onClick={() => setPublicMenuOpen(false)}/>}<aside ref={publicDrawerRef} id="website-mobile-navigation" className={`websiteMobileMenu${publicMenuOpen ? ' open' : ''}`} aria-label="Navigasi website"><div className="websiteMobileMenuHeader"><b>Menu</b><button type="button" aria-label="Tutup navigasi website" onClick={() => { setPublicMenuOpen(false); publicMenuButtonRef.current?.focus(); }}>Tutup</button></div><nav>{publicNavigation}</nav></aside>{children}<footer className="publicGlobalFooter"><div><section><b>BATAM TRAVELLING</b><p>Perjalanan terencana dari Batam untuk keluarga, grup, dan perusahaan.</p><small>Informasi perjalanan yang jelas, aman, dan mudah diakses kapan saja.</small></section><nav aria-label="Jelajahi"><b>Jelajahi</b><Link href="/trips">Paket Trip</Link><Link href="/promotions">Promo</Link><Link href="/articles">Artikel</Link></nav><nav aria-label="Bantuan"><b>Bantuan</b><Link href="/contact">Kontak</Link><Link href="/terms">Syarat & Kebijakan</Link><Link href="/my-trip">Perjalanan Saya</Link></nav></div></footer>{wa && <a className="floatingWhatsapp" href={waHref} target="_blank" rel="noreferrer" aria-label="Chat WhatsApp" onClick={() => { try {
            localStorage.setItem('bt_whatsapp_rotation', String(nextIndex));
        }
        catch { } }}>WA <span>{nextWa === wa ? 'Chat WhatsApp' : 'Nomor berganti'}</span></a>}</>;
    }
    const navigation = <>
    {accessState === 'loading' && <div className="erpNavSkeleton" aria-label="Memuat navigasi" aria-busy="true">{Array.from({ length: 9 }, (_, index) => <span key={index}/>)}</div>}
    {accessState === 'unauthorized' && <div className="erpAccessState" role="status"><b>Sesi diperlukan</b><span>Masuk untuk melihat modul sesuai izin Anda.</span><Link href="/erp-sign-in">Masuk ERP</Link></div>}
    {accessState === 'error' && <div className="erpAccessState error" role="alert"><b>Navigasi tidak tersedia</b><span>API akses tidak dapat dihubungi. Tidak ada izin yang dibuka.</span></div>}
    {accessState === 'authenticated' && <nav className="erpNav" aria-label="Navigasi ERP">{groupedMenu.map(group => { const groupActive = group.items.some(item => pathname?.startsWith(item.href)); return group.label === 'Utama' ? group.items.map(item => <Link key={item.href} href={item.href} aria-current={pathname?.startsWith(item.href) ? 'page' : undefined} className={pathname?.startsWith(item.href) ? 'active' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>) : <details key={group.label} open={groupActive}><summary>{group.label}<span aria-hidden="true">⌄</span></summary><div>{group.items.map(item => { const active = pathname?.startsWith(item.href); return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={active ? 'active' : undefined}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>; })}</div></details>; })}</nav>}
  </>;
    return (<div className="erpShell">
      <header className="erpMobileHeader">
        <button ref={menuButtonRef} className="erpMenuButton" type="button" aria-label="Buka navigasi ERP" aria-expanded={drawerOpen} aria-controls="erp-navigation" onClick={() => setDrawerOpen(true)}><span aria-hidden="true">☰</span></button>
        <Link href="/dashboard" className="erpMobileBrand"><span aria-hidden="true">BT</span> BATAM TRAVELLING</Link>
      </header>
      {drawerOpen && <button className="erpDrawerOverlay" type="button" aria-label="Tutup navigasi" onClick={() => setDrawerOpen(false)}/>}
      <aside ref={drawerRef} id="erp-navigation" className={`erpSidebar${drawerOpen ? ' open' : ''}`} aria-label="Sidebar ERP">
        <button className="erpDrawerClose" type="button" aria-label="Tutup navigasi ERP" onClick={() => { setDrawerOpen(false); menuButtonRef.current?.focus(); }}>×</button>
        <Link href="/dashboard" className="erpBrand">{brand.erpLogoUrl ? <img src={brand.erpLogoUrl} alt="Batam Travelling ERP"/> : <><span aria-hidden="true">BT</span><strong>Batam Travelling<small>Operations Suite</small></strong></>}</Link>
        <div className="erpNavLabel">Modul ERP</div>
        <div className="erpNavigation">{navigation}</div>
        <div className="erpSidebarFooter">
          <div className="erpTenantPanel">
            <b>Batam Travelling</b>
            <span>{accessState === 'authenticated' ? `Role: ${access.role}` : accessState === 'loading' ? 'Memuat akses…' : 'Akses belum tersedia'}</span>
          </div>
          <div className="erpSidebarLinks">
            <Link href="/erp-sign-in">Masuk ERP</Link>
            <Link href="/dashboard">Buka Dashboard</Link>
          </div>
        </div>
      </aside>
      <div className="erpWorkspace">
        <header className="erpTopbar">
          <div><small>Workspace</small><strong>{currentNavItem?.label ?? 'Operations Suite'}</strong></div>
          <div className="erpTopbarMeta"><span className={`erpConnection ${accessState}`}>{accessState === 'authenticated' ? 'Terhubung' : accessState === 'loading' ? 'Memeriksa sesi' : 'Akses terbatas'}</span><span className="erpRole">{access.role || 'Guest'}</span></div>
        </header>
        <div className="erpMain">{children}</div>
      </div>
    </div>);
}
