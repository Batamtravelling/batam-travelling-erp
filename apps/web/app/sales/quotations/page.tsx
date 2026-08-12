import Link from 'next/link';
import { QuotationWorkspace } from '../../../components/quotation-workspace';

export default function QuotationsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f5f7fb' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px' }}>Quotations</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Ringkasan quotation dari lead yang sudah dikualifikasi.</p>
          </div>
          <Link href="/dashboard" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: 600 }}>Kembali</Link>
        </div>
        <QuotationWorkspace />
      </div>
    </main>
  );
}
