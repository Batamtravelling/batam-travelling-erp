import { describe, expect, it } from 'vitest';
import { invoiceRefundBalanceIssue, orphanRefundLedgerIssue, refundLedgerIssue } from './refund-reconciliation.js';

describe('refund reconciliation', () => {
  it('detects missing refund ledger', () => {
    expect(refundLedgerIssue({ id: 'r1', refundNumber: 'RFD-1', amount: 100, payment: { invoiceId: 'i1' }, financialEntry: null })).toMatchObject({ type: 'MISSING_REFUND_LEDGER' });
  });

  it('detects mismatched refund ledger', () => {
    expect(refundLedgerIssue({ id: 'r1', refundNumber: 'RFD-1', amount: 100, payment: { invoiceId: 'i1' }, financialEntry: { id: 'e1', refundId: 'r1', invoiceId: 'i1', amount: 99, direction: 'OUT', origin: 'REFUND', status: 'POSTED' } })).toMatchObject({ type: 'REFUND_LEDGER_MISMATCH' });
  });

  it('detects orphan refund ledger', () => {
    expect(orphanRefundLedgerIssue({ id: 'e1', refundId: 'r1', refund: null })).toMatchObject({ type: 'ORPHAN_REFUND_LEDGER' });
  });

  it('detects invoice net-paid mismatch after refund', () => {
    expect(invoiceRefundBalanceIssue({ id: 'i1', invoiceNumber: 'INV-1', totalAmount: 1000, paidAmount: 1000, status: 'PAID', payments: [{ amount: 1000, refunds: [{ amount: 250 }] }] })).toMatchObject({ type: 'INVOICE_REFUND_BALANCE_MISMATCH', expectedPaid: 750, expectedStatus: 'PARTIALLY_PAID' });
  });

  it('accepts a fully reconciled refund snapshot', () => {
    expect(invoiceRefundBalanceIssue({ id: 'i1', invoiceNumber: 'INV-1', totalAmount: 1000, paidAmount: 750, status: 'PARTIALLY_PAID', payments: [{ amount: 1000, refunds: [{ amount: 250 }] }] })).toBeNull();
  });
});
