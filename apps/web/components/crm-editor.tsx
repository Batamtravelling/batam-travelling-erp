'use client';

import { FormEvent, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/api';

type EditorKind = 'customers' | 'leads';

type CustomerOption = {
  id: string;
  customerCode: string;
  fullName: string;
};

type CrmRecord = {
  id: string;
  customerCode?: string;
  leadCode?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  notes?: string;
  source?: string;
  requirement?: string;
  destination?: string;
  pax?: number;
  priority?: string;
  status?: string;
  customer?: {
    id: string;
    fullName: string;
  };
};

type CrmEditorProps = {
  kind: EditorKind;
  open: boolean;
  record?: CrmRecord | null;
  onClose: () => void;
  onSaved: () => void;
};

export function CrmEditor({ kind, open, record, onClose, onSaved }: CrmEditorProps) {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [customerForm, setCustomerForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    notes: '',
  });
  const [leadForm, setLeadForm] = useState({
    customerId: '',
    source: '',
    requirement: '',
    destination: '',
    pax: '',
    priority: 'NORMAL',
    notes: '',
  });

  useEffect(() => {
    if (!open || kind !== 'leads') return;

    const loadCustomers = async () => {
      try {
        const data = await apiGet<CustomerOption[]>('/customers');
        setCustomers(data);
      } catch {
        setCustomers([]);
      }
    };

    loadCustomers();
  }, [kind, open]);

  useEffect(() => {
    if (!open) return;

    if (kind === 'customers') {
      setCustomerForm({
        fullName: record?.fullName ?? '',
        phone: record?.phone ?? '',
        email: record?.email ?? '',
        city: record?.city ?? '',
        notes: record?.notes ?? '',
      });
    } else {
      setLeadForm({
        customerId: record?.customer?.id ?? '',
        source: record?.source ?? '',
        requirement: record?.requirement ?? '',
        destination: record?.destination ?? '',
        pax: record?.pax?.toString() ?? '',
        priority: record?.priority ?? 'NORMAL',
        notes: record?.notes ?? '',
      });
    }
  }, [kind, open, record]);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      if (kind === 'customers') {
        if (record?.id) {
          await apiPatch(`/customers/${record.id}`, {
            fullName: customerForm.fullName,
            phone: customerForm.phone || undefined,
            email: customerForm.email || undefined,
            city: customerForm.city || undefined,
            notes: customerForm.notes || undefined,
          });
        } else {
          await apiPost('/customers', {
            fullName: customerForm.fullName,
            phone: customerForm.phone || undefined,
            email: customerForm.email || undefined,
            city: customerForm.city || undefined,
            notes: customerForm.notes || undefined,
          });
        }
      } else {
        if (record?.id) {
          await apiPatch(`/leads/${record.id}`, {
            customerId: leadForm.customerId,
            source: leadForm.source,
            requirement: leadForm.requirement || undefined,
            destination: leadForm.destination || undefined,
            pax: leadForm.pax ? Number(leadForm.pax) : undefined,
            priority: leadForm.priority,
            notes: leadForm.notes || undefined,
          });
        } else {
          await apiPost('/leads', {
            customerId: leadForm.customerId,
            source: leadForm.source,
            requirement: leadForm.requirement || undefined,
            destination: leadForm.destination || undefined,
            pax: leadForm.pax ? Number(leadForm.pax) : undefined,
            priority: leadForm.priority,
            notes: leadForm.notes || undefined,
          });
        }
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tidak dapat menyimpan data');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 40 }}>
      <div style={{ width: '100%', maxWidth: '560px', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0 }}>{record?.id ? 'Edit' : 'Tambah'} {kind === 'customers' ? 'Customer' : 'Lead'}</h3>
            <p style={{ margin: '4px 0 0', color: '#64748b' }}>
              {kind === 'customers' ? 'Kelola data pelanggan untuk CRM.' : 'Kelola inquiry dan hubungkan ke customer yang ada.'}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '18px' }}>
            ✕
          </button>
        </div>

        {error ? <p style={{ color: '#b91c1c', marginBottom: '12px' }}>{error}</p> : null}

        <form onSubmit={submit} style={{ display: 'grid', gap: '12px' }}>
          {kind === 'customers' ? (
            <>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Nama lengkap</span>
                <input required value={customerForm.fullName} onChange={(event) => setCustomerForm((current) => ({ ...current, fullName: event.target.value }))} style={inputStyle} />
              </label>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Telepon</span>
                  <input value={customerForm.phone} onChange={(event) => setCustomerForm((current) => ({ ...current, phone: event.target.value }))} style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Email</span>
                  <input type="email" value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} style={inputStyle} />
                </label>
              </div>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Kota</span>
                <input value={customerForm.city} onChange={(event) => setCustomerForm((current) => ({ ...current, city: event.target.value }))} style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Catatan</span>
                <textarea value={customerForm.notes} onChange={(event) => setCustomerForm((current) => ({ ...current, notes: event.target.value }))} style={{ ...inputStyle, minHeight: '90px' }} />
              </label>
            </>
          ) : (
            <>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Customer</span>
                <select required value={leadForm.customerId} onChange={(event) => setLeadForm((current) => ({ ...current, customerId: event.target.value }))} style={inputStyle}>
                  <option value="">Pilih customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerCode} - {customer.fullName}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Sumber</span>
                <input required value={leadForm.source} onChange={(event) => setLeadForm((current) => ({ ...current, source: event.target.value }))} style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: '6px' }}>
                <span>Requirement</span>
                <textarea value={leadForm.requirement} onChange={(event) => setLeadForm((current) => ({ ...current, requirement: event.target.value }))} style={{ ...inputStyle, minHeight: '90px' }} />
              </label>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Tujuan</span>
                  <input value={leadForm.destination} onChange={(event) => setLeadForm((current) => ({ ...current, destination: event.target.value }))} style={inputStyle} />
                </label>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Pax</span>
                  <input type="number" min="1" value={leadForm.pax} onChange={(event) => setLeadForm((current) => ({ ...current, pax: event.target.value }))} style={inputStyle} />
                </label>
              </div>
              <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Prioritas</span>
                  <select value={leadForm.priority} onChange={(event) => setLeadForm((current) => ({ ...current, priority: event.target.value }))} style={inputStyle}>
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </label>
                <label style={{ display: 'grid', gap: '6px' }}>
                  <span>Catatan</span>
                  <input value={leadForm.notes} onChange={(event) => setLeadForm((current) => ({ ...current, notes: event.target.value }))} style={inputStyle} />
                </label>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            {record?.id ? (
              <button type="button" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await apiDelete(`/${kind}/${record.id}`); onSaved(); onClose(); } catch (err) { setError(err instanceof Error ? err.message : 'Tidak dapat menghapus data'); } finally { setBusy(false); } }} style={{ border: '1px solid #ef4444', background: 'white', color: '#ef4444', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}>
                {busy ? 'Menghapus...' : 'Hapus'}
              </button>
            ) : null}
            <button type="button" onClick={onClose} style={{ border: '1px solid #cbd5e1', background: 'white', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}>
              Batal
            </button>
            <button type="submit" disabled={busy} style={{ border: 'none', background: '#0f766e', color: 'white', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer' }}>
              {busy ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  borderRadius: '10px',
  padding: '10px 12px',
  fontSize: '14px',
};
