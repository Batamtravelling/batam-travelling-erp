import Link from 'next/link';

const payments = [
  { id: 'PY-001', customer: 'Rina Suryani', amount: 'Rp 6.000.000', method: 'Transfer', status: 'Verified', note: 'Pembayaran masuk hari ini' },
  { id: 'PY-002', customer: 'Budi Santoso', amount: 'Rp 3.500.000', method: 'Cash', status: 'Pending', note: 'Menunggu verifikasi kasir' },
  { id: 'PY-003', customer: 'Dewi Lestari', amount: 'Rp 4.250.000', method: 'E-Wallet', status: 'Verified', note: 'Pembayaran disetujui otomatis' },
];

export default function PaymentsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Finance</p>
            <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Payments</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Pantau penerimaan pembayaran dan status verifikasi.</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>← Kembali</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Verified</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>2</div>
          </div>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px' }}>
            <div style={{ color: '#64748b', fontSize: '13px' }}>Pending</div>
            <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>1</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 10px' }}>Payment</th>
              <th style={{ padding: '12px 10px' }}>Customer</th>
              <th style={{ padding: '12px 10px' }}>Amount</th>
              <th style={{ padding: '12px 10px' }}>Method</th>
              <th style={{ padding: '12px 10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 10px', fontWeight: 700 }}>{payment.id}</td>
                <td style={{ padding: '12px 10px' }}>{payment.customer}</td>
                <td style={{ padding: '12px 10px' }}>{payment.amount}</td>
                <td style={{ padding: '12px 10px' }}>{payment.method}</td>
                <td style={{ padding: '12px 10px' }}>
                  <div style={{ display: 'grid', gap: '4px' }}>
                    <span style={{ padding: '6px 10px', borderRadius: '999px', background: payment.status === 'Verified' ? '#dcfce7' : '#fef3c7', color: payment.status === 'Verified' ? '#166534' : '#92400e', fontWeight: 700, width: 'fit-content' }}>{payment.status}</span>
                    <div style={{ color: '#64748b', fontSize: '13px' }}>{payment.note}</div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
