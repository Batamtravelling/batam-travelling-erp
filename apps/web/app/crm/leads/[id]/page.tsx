import Link from 'next/link';
import { LeadDetailClient } from '../../../../components/data-shell';

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: 'var(--app-background)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
        <Link href="/crm/leads" style={{ color: 'var(--brand-navy-primary)', textDecoration: 'none', fontWeight: 600 }}>← Kembali ke Leads</Link>
        <h1 style={{ margin: '16px 0 8px' }}>Detail Lead</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>Data detail lead diambil dari API backend.</p>
        <div style={{ marginTop: '18px' }}>
          <LeadDetailClient leadId={id} />
        </div>
      </div>
    </main>
  );
}
