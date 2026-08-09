import Link from 'next/link';

const invoices = [
  { code: 'INV-001', customer: 'Rina Suryani', amount: 'Rp 12.000.000', issued: '2026-08-01', status: 'Paid' },
  { code: 'INV-002', customer: 'Budi Santoso', amount: 'Rp 8.500.000', issued: '2026-08-05', status: 'Outstanding' },
  { code: 'INV-003', customer: 'Dewi Lestari', amount: 'Rp 15.750.000', issued: '2026-08-08', status: 'Pending' },
];

export default function InvoicesPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Finance</p>
            <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Invoices</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Pantau tagihan pelanggan dan status pembayaran.</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>← Kembali</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Total invoice</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>3</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Paid</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>1</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Outstanding</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>1</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 10px' }}>Invoice</th>
              <th style={{ padding: '12px 10px' }}>Customer</th>
              <th style={{ padding: '12px 10px' }}>Amount</th>
              <th style={{ padding: '12px 10px' }}>Issued</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 700 }}>{invoice.code}</td>
                <td style={{ padding: '12px 10px' }}>{invoice.customer}</td>
                <td style={{ padding: '12px 10px' }}>{invoice.amount}</td>
                <td style={{ padding: '12px 10px', color: '#64748b' }}>{invoice.issued}</td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{ padding: '6px 10px', borderRadius: '999px', background: invoice.status === 'Paid' ? '#dcfce7' : invoice.status === 'Outstanding' ? '#fef3c7' : '#e0f2fe', color: invoice.status === 'Paid' ? '#166534' : invoice.status === 'Outstanding' ? '#92400e' : '#075985', fontWeight: 700 }}>{invoice.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
