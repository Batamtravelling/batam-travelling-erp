"use client";

import { useEffect, useState } from 'react';

interface PackageRow {
  id: string;
  packageCode: string;
  name: string;
  destination: string;
  durationDays: number;
  sellingPrice: number;
  status: string;
}

const emptyForm = {
  packageCode: '',
  name: '',
  destination: '',
  durationDays: '1',
  sellingPrice: '0',
  status: 'DRAFT',
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPackages();
  }, []);

  const createPackage = async (event: React.FormEvent) => {
    event.preventDefault();
    await fetch('http://localhost:3000/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        packageCode: form.packageCode,
        name: form.name,
        destination: form.destination,
        durationDays: Number(form.durationDays),
        sellingPrice: Number(form.sellingPrice),
        status: form.status,
      }),
    });
    setForm(emptyForm);
    void fetchPackages();
  };

  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
            <div>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Packages</p>
              <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Travel packages</h1>
              <p style={{ margin: 0, color: '#64748b' }}>Kelola paket travel, harga, dan destinasi promosi.</p>
            </div>
          </div>

          <form onSubmit={createPackage} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '18px' }}>
            <input required value={form.packageCode} onChange={(event) => setForm({ ...form, packageCode: event.target.value })} placeholder="Kode paket" style={inputStyle} />
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama paket" style={inputStyle} />
            <input required value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="Destinasi" style={inputStyle} />
            <input required type="number" min="1" value={form.durationDays} onChange={(event) => setForm({ ...form, durationDays: event.target.value })} placeholder="Durasi hari" style={inputStyle} />
            <input required type="number" min="0" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} placeholder="Harga" style={inputStyle} />
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} style={inputStyle}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button type="submit" style={{ border: 0, borderRadius: '10px', background: '#0f766e', color: 'white', fontWeight: 700, padding: '12px 14px', cursor: 'pointer' }}>Tambah paket</button>
          </form>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          {loading ? <div>Memuat paket...</div> : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {packages.length === 0 ? <div style={{ color: '#64748b' }}>Belum ada paket.</div> : packages.map((pkg) => (
                <div key={pkg.id} style={{ border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{pkg.name}</div>
                    <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{pkg.packageCode} • {pkg.destination} • {pkg.durationDays} hari</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 700 }}>Rp {pkg.sellingPrice.toLocaleString('id-ID')}</div>
                    <span style={{ padding: '6px 10px', borderRadius: '999px', background: pkg.status === 'ACTIVE' ? '#dcfce7' : pkg.status === 'ARCHIVED' ? '#fee2e2' : '#e0f2fe', color: pkg.status === 'ACTIVE' ? '#166534' : pkg.status === 'ARCHIVED' ? '#991b1b' : '#075985', fontWeight: 700 }}>{pkg.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
};
