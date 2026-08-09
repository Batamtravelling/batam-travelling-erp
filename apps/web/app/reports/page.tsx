'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

type Customer = { id: string; fullName: string };
type Lead = { id: string; status: string; estimatedValue?: number; travelDate?: string; customer: Customer };

type ReportCard = { title: string; value: string; detail: string };

const fallbackCards: ReportCard[] = [
  { title: 'Revenue', value: 'Rp 84.5M', detail: 'Revenue kumulatif bulan ini' },
  { title: 'Conversion', value: '31%', detail: 'Lead menjadi booking' },
  { title: 'Outstanding', value: 'Rp 12.3M', detail: 'Invoice belum dibayar' },
  { title: 'Trips ready', value: '5', detail: 'Trip siap berjalan' },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function ReportsPage() {
  const [reportCards, setReportCards] = useState<ReportCard[]>(fallbackCards);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage('');
      try {
        const [leads, customers] = await Promise.all([apiGet<Lead[]>('/leads'), apiGet<Customer[]>('/customers')]);
        if (!active) return;

        const wonLeads = leads.filter((lead) => lead.status === 'WON');
        const activeLeads = leads.filter((lead) => !['LOST', 'WON'].includes(lead.status));
        const quotationLeads = leads.filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status));
        const readyTrips = wonLeads.filter((lead) => Boolean(lead.travelDate)).length;
        const revenue = wonLeads.reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0);
        const conversion = leads.length ? Math.round((wonLeads.length / leads.length) * 100) : 0;
        const outstanding = quotationLeads.reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0);

        setReportCards([
          { title: 'Revenue', value: formatCurrency(revenue), detail: `${wonLeads.length} booking berhasil` },
          { title: 'Conversion', value: `${conversion}%`, detail: `${wonLeads.length} dari ${leads.length} lead` },
          { title: 'Outstanding', value: formatCurrency(outstanding), detail: `${quotationLeads.length} quotation berjalan` },
          { title: 'Trips ready', value: String(readyTrips), detail: `${customers.length} customer aktif` },
        ]);
      } catch (error) {
        const err = error as Error;
        setMessage(err.message);
        setReportCards(fallbackCards);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div>
            <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Reports</p>
            <h1 style={{ margin: '6px 0', fontSize: '28px' }}>Business reports</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Pantau performa bisnis dari satu dashboard ringkasan.</p>
          </div>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: '#0f766e', fontWeight: 700 }}>← Kembali</Link>
        </div>

        {message ? <p style={{ margin: '0 0 16px', color: '#b45309', fontSize: '13px' }}>Data contoh ditampilkan karena API belum tersedia: {message}</p> : null}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {reportCards.map((card) => (
            <article key={card.title} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px' }}>
              <div style={{ color: '#64748b', fontSize: '13px' }}>{card.title}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, marginTop: '8px' }}>{loading ? '…' : card.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '6px' }}>{loading ? 'Memuat data backend…' : card.detail}</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
