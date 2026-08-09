import Link from 'next/link';

const modules = [
  { href: '/dashboard', title: 'Dashboard', description: 'Ringkasan KPI CRM, booking, invoice, dan trip.' },
  { href: '/crm/leads', title: 'CRM Leads', description: 'Kelola inquiry, follow-up, dan pipeline sales.' },
  { href: '/crm/customers', title: 'CRM Customers', description: 'Pantau riwayat customer dan status hubungan.' },
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f5f7fb', color: '#111827' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <section style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
          <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>BATAM TRAVELLING</p>
          <h1 style={{ margin: '8px 0', fontSize: '32px' }}>Fondasi MVP CRM telah siap</h1>
          <p style={{ margin: 0, lineHeight: 1.6, color: '#475569' }}>
            Aplikasi sekarang memiliki shell modul CRM yang siap dihubungkan ke backend, plus aturan bisnis lead untuk transisi sales yang lebih terukur.
          </p>
        </section>

        <section style={{ display: 'grid', gap: '16px' }}>
          {modules.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <article style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>{item.title}</h2>
                <p style={{ margin: 0, color: '#64748b' }}>{item.description}</p>
              </article>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
