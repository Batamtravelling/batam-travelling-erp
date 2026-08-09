import { describe, expect, it } from 'vitest';
import { buildBookingRecord, buildQuotationRecord } from './quote-helpers.js';

describe('sales helper records', () => {
  it('builds a quotation summary from a lead', () => {
    const record = buildQuotationRecord({
      id: 'lead-1',
      leadCode: 'LEAD-000001',
      source: 'Website',
      destination: 'Bintan',
      pax: 4,
      estimatedValue: 1200000,
      customer: { fullName: 'Rina' },
      status: 'QUOTATION',
    } as any);

    expect(record.quoteCode).toBe('QT-000001');
    expect(record.customerName).toBe('Rina');
    expect(record.totalPax).toBe(4);
  });

  it('builds a booking summary from a won lead', () => {
    const record = buildBookingRecord({
      id: 'lead-2',
      leadCode: 'LEAD-000002',
      source: 'Instagram',
      destination: 'Batam',
      pax: 2,
      customer: { fullName: 'Budi' },
      status: 'WON',
    } as any);

    expect(record.bookingCode).toBe('BK-000002');
    expect(record.customerName).toBe('Budi');
    expect(record.status).toBe('Confirmed');
  });
});
