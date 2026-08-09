'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '../lib/api';

type LeadRecord = {
  id: string;
  leadCode: string;
  source: string;
  requirement?: string;
  destination?: string;
  pax?: number;
  estimatedValue?: number;
  priority?: string;
  status?: string;
  notes?: string;
  customer?: {
    fullName?: string;
    customerCode?: string;
  };
};

type QuoteRecord = {
  quoteCode: string;
  customerName: string;
  destination: string;
  totalPax: number;
  estimatedValue: number;
  status: string;
};

type BookingRecord = {
  bookingCode: string;
  customerName: string;
  destination: string;
  totalPax: number;
  status: string;
};

export function LeadDetailClient({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await apiGet<LeadRecord>(`/leads/${leadId}`);
        if (!ignore) setLead(data);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Gagal memuat data');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, [leadId]);

  if (loading) return <p>Memuat detail lead...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!lead) return <p>Lead tidak ditemukan.</p>;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Lead Code:</strong> {lead.leadCode}
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Customer:</strong> {lead.customer?.fullName ?? '—'}
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Destination:</strong> {lead.destination ?? '—'}
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Status:</strong> {lead.status ?? 'NEW'}
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Requirement:</strong> {lead.requirement ?? '—'}
      </div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
        <strong>Estimated Value:</strong> Rp {Number(lead.estimatedValue ?? 0).toLocaleString('id-ID')}
      </div>
    </div>
  );
}

export function QuotationsClient() {
  const [rows, setRows] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await apiGet<QuoteRecord[]>('/sales/quotations');
        if (!ignore) setRows(data);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Gagal memuat quotation');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, []);

  if (loading) return <p>Memuat quotation...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!rows.length) return <p>Belum ada quotation.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ padding: '10px 8px' }}>Code</th>
          <th style={{ padding: '10px 8px' }}>Customer</th>
          <th style={{ padding: '10px 8px' }}>Destination</th>
          <th style={{ padding: '10px 8px' }}>Pax</th>
          <th style={{ padding: '10px 8px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.quoteCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px 8px' }}>{row.quoteCode}</td>
            <td style={{ padding: '10px 8px' }}>{row.customerName}</td>
            <td style={{ padding: '10px 8px' }}>{row.destination}</td>
            <td style={{ padding: '10px 8px' }}>{row.totalPax}</td>
            <td style={{ padding: '10px 8px' }}>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function BookingsClient() {
  const [rows, setRows] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await apiGet<BookingRecord[]>('/sales/bookings');
        if (!ignore) setRows(data);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : 'Gagal memuat booking');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => { ignore = true; };
  }, []);

  if (loading) return <p>Memuat booking...</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!rows.length) return <p>Belum ada booking.</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
          <th style={{ padding: '10px 8px' }}>Code</th>
          <th style={{ padding: '10px 8px' }}>Customer</th>
          <th style={{ padding: '10px 8px' }}>Destination</th>
          <th style={{ padding: '10px 8px' }}>Pax</th>
          <th style={{ padding: '10px 8px' }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.bookingCode} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '10px 8px' }}>{row.bookingCode}</td>
            <td style={{ padding: '10px 8px' }}>{row.customerName}</td>
            <td style={{ padding: '10px 8px' }}>{row.destination}</td>
            <td style={{ padding: '10px 8px' }}>{row.totalPax}</td>
            <td style={{ padding: '10px 8px' }}>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
