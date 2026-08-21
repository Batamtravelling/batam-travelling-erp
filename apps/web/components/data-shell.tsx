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
  if (error) return <p style={{ color: 'var(--status-error)' }}>{error}</p>;
  if (!lead) return <p>Lead tidak ditemukan.</p>;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Lead Code:</strong> {lead.leadCode}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Customer:</strong> {lead.customer?.fullName ?? '—'}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Destination:</strong> {lead.destination ?? '—'}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Status:</strong> {lead.status ?? 'NEW'}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Requirement:</strong> {lead.requirement ?? '—'}
      </div>
      <div style={{ border: '1px solid var(--border-default)', borderRadius: '12px', padding: '16px' }}>
        <strong>Estimated Value:</strong> Rp {Number(lead.estimatedValue ?? 0).toLocaleString('id-ID')}
      </div>
    </div>
  );
}
