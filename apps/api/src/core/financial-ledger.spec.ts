import { describe, expect, it } from 'vitest';
import { buildPaymentRefundLedgerEntry, buildVerifiedPaymentLedgerEntry } from './financial-ledger';

describe('buildVerifiedPaymentLedgerEntry', () => {
  it('keeps canonical payment lineage and posts a cash receipt', () => {
    const receivedAt = new Date('2026-08-12T08:30:00.000Z');
    const entry = buildVerifiedPaymentLedgerEntry({
      tenantId: 'tenant-1',
      recordedById: 'user-1',
      paymentId: 'payment-1',
      paymentNumber: 'PAY-001',
      invoiceId: 'invoice-1',
      invoiceNumber: 'INV-001',
      bookingId: 'booking-1',
      amount: 1250000,
      receivedAt,
      reference: 'BANK-REF-1',
    });

    expect(entry).toMatchObject({
      tenantId: 'tenant-1',
      paymentId: 'payment-1',
      invoiceId: 'invoice-1',
      bookingId: 'booking-1',
      origin: 'PAYMENT',
      status: 'POSTED',
      direction: 'IN',
      category: 'CUSTOMER_PAYMENT',
      amount: 1250000,
      reference: 'BANK-REF-1',
    });
    expect(entry.transactionDate).toBe(receivedAt);
  });

  it('uses the immutable payment number when external reference is empty', () => {
    const entry = buildVerifiedPaymentLedgerEntry({
      tenantId: 'tenant-1',
      recordedById: 'user-1',
      paymentId: 'payment-1',
      paymentNumber: 'PAY-001',
      invoiceId: 'invoice-1',
      invoiceNumber: 'INV-001',
      bookingId: 'booking-1',
      amount: 500000,
      receivedAt: new Date('2026-08-12T08:30:00.000Z'),
      reference: null,
    });

    expect(entry.reference).toBe('PAY-001');
  });
});

describe('buildPaymentRefundLedgerEntry', () => {
  it('posts an immutable refund as an OUT entry with refund lineage', () => {
    const refundedAt = new Date('2026-08-13T04:00:00.000Z');
    const entry = buildPaymentRefundLedgerEntry({
      tenantId: 'tenant-1',
      recordedById: 'finance-1',
      refundId: 'refund-1',
      refundNumber: 'RFD-000001',
      paymentId: 'payment-1',
      paymentNumber: 'PAY-001',
      invoiceId: 'invoice-1',
      invoiceNumber: 'INV-001',
      bookingId: 'booking-1',
      amount: 250000,
      refundedAt,
      reference: null,
      reason: 'Customer cancellation',
    });

    expect(entry).toMatchObject({
      refundId: 'refund-1',
      invoiceId: 'invoice-1',
      bookingId: 'booking-1',
      origin: 'REFUND',
      status: 'POSTED',
      direction: 'OUT',
      category: 'CUSTOMER_REFUND',
      amount: 250000,
      reference: 'RFD-000001',
      notes: 'Customer cancellation',
    });
    expect(entry.transactionDate).toBe(refundedAt);
  });
});
