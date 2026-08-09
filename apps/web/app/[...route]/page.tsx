import Link from 'next/link';
const modules: Record<string, { title: string; description: string; action: string }> = {
  dashboard: { title: 'Dashboard', description: 'Ringkasan operasi, pipeline sales, pembayaran, dan perjalanan mendatang.', action: 'Lihat laporan' },
  'crm/leads': { title: 'Leads', description: 'Kelola inquiry, follow-up, dan progres pipeline sales.', action: 'Tambah lead' },
  'crm/customers': { title: 'Customers', description: 'Satu riwayat customer untuk CRM, quotation, booking, dan dokumen.', action: 'Tambah customer' },
  'crm/follow-ups': { title: 'Follow-ups', description: 'Prioritaskan tindak lanjut yang jatuh tempo.', action: 'Tambah follow-up' },
  'sales/packages': { title: 'Packages & Pricing', description: 'Susun paket, itinerary, dan harga tanpa mengubah transaksi historis.', action: 'Buat paket' },
  'sales/quotations': { title: 'Quotations', description: 'Siapkan proposal perjalanan dan lacak versi serta persetujuannya.', action: 'Buat quotation' },
  bookings: { title: 'Bookings', description: 'Pantau perjalanan pelanggan dari quotation sampai selesai.', action: 'Buat booking' },
  'operations/trips': { title: 'Trip Board', description: 'Koordinasikan jadwal, vendor, dan penugasan tim.', action: 'Buat trip' },
  'operations/vendors': { title: 'Vendors', description: 'Kelola supplier dan kesiapan layanan perjalanan.', action: 'Tambah vendor' },
  'finance/invoices': { title: 'Invoices', description: 'Kelola tagihan dan saldo pelanggan secara terkontrol.', action: 'Buat invoice' },
  'finance/payments': { title: 'Payments', description: 'Tinjau bukti pembayaran; verifikasi tetap dilakukan oleh backend.', action: 'Catat pembayaran' },
  reports: { title: 'Reports', description: 'Pantau revenue, outstanding, konversi, dan kesiapan operasional.', action: 'Atur laporan' },
  settings: { title: 'Settings', description: 'Pengaturan tenant, user, role, dan konfigurasi aplikasi.', action: 'Kelola pengguna' },
};
const nav = [['Dashboard','/dashboard'],['CRM','/crm/leads'],['Customers','/crm/customers'],['Packages','/sales/packages'],['Quotations','/sales/quotations'],['Bookings','/bookings'],['Operations','/operations/trips'],['Finance','/finance/invoices'],['Reports','/reports'],['Settings','/settings']];
export default async function ModulePage({ params }: { params: Promise<{ route: string[] }> }) {
  const { route } = await params; const path = route.join('/'); const page = modules[path] ?? { title: 'Modul sedang disiapkan', description: 'Rute ini sudah tersedia dalam application shell dan akan dihubungkan ke API pada increment berikutnya.', action: 'Kembali ke dashboard' };
  return <main className="shell"><aside><Link className="brand" href="/dashboard">BT<span>ERP</span></Link><nav>{nav.map(([name, href]) => <Link key={href} className={href === `/${path}` ? 'active' : ''} href={href}>{name}</Link>)}</nav><small>Batam Travelling<br/>Tenant Owner</small></aside><section className="content"><header><input aria-label="Cari data" placeholder="Cari customer, booking, quotation..."/><button aria-label="Notifikasi">Notifications</button><button className="avatar">TO</button></header><div className="crumb">ERP / {page.title}</div><div className="heading"><div><h1>{page.title}</h1><p>{page.description}</p></div><button className="primary">+ {page.action}</button></div><div className="kpis"><article><span>Perlu perhatian</span><strong>0</strong><em>Data akan tampil dari API</em></article><article><span>Status</span><strong>Siap</strong><em>Role-aware application shell</em></article><article><span>Integrasi</span><strong>API</strong><em>Backend sedang dihubungkan</em></article></div><section className="panel"><div className="panelHead"><h2>{page.title} terbaru</h2><button>Filter</button></div><div className="empty"><b>Belum ada data untuk ditampilkan.</b><p>Gunakan aksi utama di atas setelah endpoint modul ini terhubung ke backend.</p></div></section></section></main>;
}
