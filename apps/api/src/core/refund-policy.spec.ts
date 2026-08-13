import { describe, expect, it } from 'vitest';
import { evaluateRefundLifecycle } from './refund-policy.js';

describe('refund lifecycle policy', () => {
  it('supports a partial refund and reopens a paid invoice', () => {
    expect(evaluateRefundLifecycle({
      paymentAmount: 1_000_000,
      alreadyRefunded: 0,
      requestedAmount: 250_000,
      invoiceTotal: 1_000_000,
      verifiedInvoicePayments: 1_000_000,
      invoiceRefundsAfterRequest: 250_000,
    })).toEqual({
      remainingBefore: 1_000_000,
      remainingAfter: 750_000,
      netPaid: 750_000,
      invoiceStatus: 'PARTIALLY_PAID',
      bookingStatus: 'PARTIALLY_PAID',
    });
  });

  it('marks invoice and booking refunded when net paid reaches zero', () => {
    const result = evaluateRefundLifecycle({
      paymentAmount: 1_000_000,
      alreadyRefunded: 250_000,
      requestedAmount: 750_000,
      invoiceTotal: 1_000_000,
      verifiedInvoicePayments: 1_000_000,
      invoiceRefundsAfterRequest: 1_000_000,
    });
    expect(result.remainingAfter).toBe(0);
    expect(result.invoiceStatus).toBe('REFUNDED');
    expect(result.bookingStatus).toBe('REFUNDED');
  });

  it('rejects over-refund', () => {
    expect(() => evaluateRefundLifecycle({
      paymentAmount: 1_000_000,
      alreadyRefunded: 800_000,
      requestedAmount: 200_001,
      invoiceTotal: 1_000_000,
      verifiedInvoicePayments: 1_000_000,
      invoiceRefundsAfterRequest: 1_000_001,
    })).toThrow('REFUND_EXCEEDS_REMAINING');
  });

  it('rejects invalid historical totals', () => {
    expect(() => evaluateRefundLifecycle({
      paymentAmount: 100,
      alreadyRefunded: 101,
      requestedAmount: 1,
      invoiceTotal: 100,
      verifiedInvoicePayments: 100,
      invoiceRefundsAfterRequest: 102,
    })).toThrow('REFUND_HISTORY_INVALID');
  });

  it('rounds money to cents before evaluating remaining refundable amount', () => {
    const result = evaluateRefundLifecycle({
      paymentAmount: 100.1,
      alreadyRefunded: 20.05,
      requestedAmount: 80.05,
      invoiceTotal: 100.1,
      verifiedInvoicePayments: 100.1,
      invoiceRefundsAfterRequest: 100.1,
    });
    expect(result.remainingAfter).toBe(0);
  });
});
