import Link from 'next/link';

const trips = [
  { id: 'TRIP-001', title: 'Bintan Family Trip', date: '2026-08-15', status: 'Ready', driver: 'Arif', vehicle: 'Van 14 seat' },
  { id: 'TRIP-002', title: 'Batam Weekend Escape', date: '2026-08-20', status: 'In Progress', driver: 'Joko', vehicle: 'Bus 30 seat' },
  { id: 'TRIP-003', title: 'Harbour Bay City Tour', date: '2026-08-22', status: 'Planned', driver: 'Sari', vehicle: 'SUV' },
];

export default function TripsPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Operations</p>
            <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Trips</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Pantau jadwal perjalanan, status trip, dan kesiapan ekspedisi.</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>← Kembali</Link>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {trips.map((trip) => (
            <div key={trip.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{trip.title}</div>
                <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{trip.id} • {trip.date} • {trip.driver} • {trip.vehicle}</div>
              </div>
              <span style={{ padding: '6px 10px', borderRadius: '999px', background: trip.status === 'Ready' ? '#dcfce7' : trip.status === 'In Progress' ? '#fef3c7' : '#e0f2fe', color: trip.status === 'Ready' ? '#166534' : trip.status === 'In Progress' ? '#92400e' : '#075985', fontWeight: 700 }}>{trip.status}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
