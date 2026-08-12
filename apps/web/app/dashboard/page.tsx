'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';

type Customer = { id: string; customerCode: string; fullName: string; phone?: string; email?: string; status?: string };
type Lead = { id: string; leadCode: string; source: string; destination?: string; pax?: number; priority: string; status: string; estimatedValue?: number; createdAt?: string; customer: Customer };

type MetricCard = { label: string; value: string; hint: string };
type ActivityItem = { title: string; detail: string; time: string };
type PageResult<T> = { items: T[]; meta: { total: number } };

const fallbackMetrics: MetricCard[] = [
  { label: 'Leads aktif', value: '—', hint: 'Data belum tersedia' },
  { label: 'Quotation', value: '—', hint: 'Data belum tersedia' },
  { label: 'Booking', value: '—', hint: 'Data belum tersedia' },
  { label: 'Outstanding', value: '—', hint: 'Data belum tersedia' },
];

const fallbackActivities: ActivityItem[] = [];


function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>(fallbackMetrics);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>(fallbackActivities);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage('');
      try {
        const [leadPage, customerPage] = await Promise.all([apiGet<PageResult<Lead>>('/leads?page=1&pageSize=100'), apiGet<PageResult<Customer>>('/customers?page=1&pageSize=100')]);
        const leads = leadPage.items;
        const customers = customerPage.items;
        if (!active) return;

        const activeLeads = leads.filter((lead) => !['LOST', 'WON'].includes(lead.status)).length;
        const quotationLeads = leads.filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status)).length;
        const bookingLeads = leads.filter((lead) => lead.status === 'WON').length;
        const outstanding = leads.filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status)).reduce((sum, lead) => sum + (lead.estimatedValue ?? 0), 0);

        const activities = leads.slice(0, 3).map((lead) => ({
          title: lead.status === 'WON' ? 'Booking confirmed' : lead.status === 'QUOTATION' ? 'Quotation prepared' : 'Lead updated',
          detail: `${lead.customer.fullName} - ${lead.destination ?? lead.source}`,
          time: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('id-ID') : 'Baru-baru ini',
        }));

        setMetrics([
          { label: 'Leads aktif', value: String(activeLeads), hint: `${customers.length} customer terdaftar` },
          { label: 'Quotation', value: String(quotationLeads), hint: 'Butuh follow-up' },
          { label: 'Booking', value: String(bookingLeads), hint: 'Siap depart' },
          { label: 'Outstanding', value: formatCurrency(outstanding), hint: 'Nilai quotation berjalan' },
        ]);
        setRecentActivities(activities.length ? activities : fallbackActivities);
      } catch (error) {
        const err = error as Error;
        setMessage(err.message);
        setMetrics(fallbackMetrics);
        setRecentActivities(fallbackActivities);
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
    <main style={{ minHeight: '100vh', padding: '32px', background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '24px' }}>
        <section style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 16px 36px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#64748b' }}>Overview</p>
              <h1 style={{ margin: '6px 0', fontSize: '30px' }}>Dashboard operasi</h1>
              <p style={{ margin: 0, color: '#64748b' }}>Ringkasan lead, quotation, booking, dan finance dalam satu tempat.</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/crm/leads" style={{ textDecoration: 'none', color: '#0f766e', background: '#ecfeff', padding: '10px 14px', borderRadius: '999px', fontWeight: 700 }}>📥 Leads</Link>
              <Link href="/sales/quotations" style={{ textDecoration: 'none', color: '#7c3aed', background: '#f5f3ff', padding: '10px 14px', borderRadius: '999px', fontWeight: 700 }}>🧾 Quotations</Link>
              <Link href="/bookings" style={{ textDecoration: 'none', color: '#ea580c', background: '#fff7ed', padding: '10px 14px', borderRadius: '999px', fontWeight: 700 }}>🛳️ Bookings</Link>
            </div>
          </div>
          {message ? <p style={{ margin: '12px 0 0', color: '#b45309', fontSize: '13px' }}>Data operasional belum dapat dimuat: {message}</p> : null}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {metrics.map((metric) => (
            <article key={metric.label} style={{ background: 'white', borderRadius: '18px', padding: '18px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
              <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>{metric.label}</p>
              <h2 style={{ margin: '8px 0 4px', fontSize: '26px' }}>{loading ? '…' : metric.value}</h2>
              <p style={{ margin: 0, color: '#0f766e', fontSize: '13px' }}>{loading ? 'Memuat data backend…' : metric.hint}</p>
            </article>
          ))}
        </section>

        <section style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1.6fr 1fr' }}>
          <article style={{ background: 'white', borderRadius: '18px', padding: '20px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ marginTop: 0 }}>Aktivitas terbaru</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              {recentActivities.length === 0 ? <p style={{ color: '#64748b' }}>Belum ada aktivitas terbaru.</p> : recentActivities.map((activity) => (
                <div key={activity.title + activity.detail} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 14px' }}>
                  <div style={{ fontWeight: 700 }}>{activity.title}</div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>{activity.detail}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>{activity.time}</div>
                </div>
              ))}
            </div>
          </article>

          <article style={{ background: 'white', borderRadius: '18px', padding: '20px', boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)' }}>
            <h3 style={{ marginTop: 0 }}>Quick actions</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <Link href="/crm/leads" style={{ textDecoration: 'none', color: '#0f172a', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>➕ Buat lead baru</Link>
              <Link href="/sales/quotations" style={{ textDecoration: 'none', color: '#0f172a', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>🧾 Lihat quotation</Link>
              <Link href="/finance/invoices" style={{ textDecoration: 'none', color: '#0f172a', background: '#f8fafc', borderRadius: '12px', padding: '12px 14px', border: '1px solid #e2e8f0' }}>💳 Kelola invoice</Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
