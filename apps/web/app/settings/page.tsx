import Link from 'next/link';

const settingsCards = [
  { title: 'Tenant profile', detail: 'Identitas tenant, branding, dan preferensi operasional' },
  { title: 'User roles', detail: 'Kelola akses pengguna dan izin berdasarkan peran' },
  { title: 'Integrations', detail: 'Koneksi dengan payment gateway, email, dan supplier' },
  { title: 'Automation', detail: 'Atur workflow notifikasi dan rule bisnis' },
];

export default function SettingsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Settings</p>
            <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Platform settings</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Konfigurasi tenant, users, dan integrasi platform.</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>← Kembali</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {settingsCards.map((card) => (
            <article key={card.title} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontWeight: 700 }}>{card.title}</div>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>{card.detail}</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
