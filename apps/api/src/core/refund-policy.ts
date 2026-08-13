export type RefundLifecycleInput = {
  paymentAmount: number;
  alreadyRefunded: number;
  requestedAmount: number;
  invoiceTotal: number;
  verifiedInvoicePayments: number;
  invoiceRefundsAfterRequest: number;
};

export type RefundLifecycleResult = {
  remainingBefore: number;
  remainingAfter: number;
  netPaid: number;
  invoiceStatus: 'REFUNDED' | 'PAID' | 'PARTIALLY_PAID' | 'ISSUED';
  bookingStatus: 'REFUNDED' | 'CONFIRMED' | 'PARTIALLY_PAID' | 'PENDING_PAYMENT';
};

function money(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function evaluateRefundLifecycle(input: RefundLifecycleInput): RefundLifecycleResult {
  const paymentAmount = money(input.paymentAmount);
  const alreadyRefunded = money(input.alreadyRefunded);
  const requestedAmount = money(input.requestedAmount);

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    throw new Error('REFUND_AMOUNT_INVALID');
  }
  if (alreadyRefunded < 0 || alreadyRefunded > paymentAmount) {
    throw new Error('REFUND_HISTORY_INVALID');
  }

  const remainingBefore = money(paymentAmount - alreadyRefunded);
  if (requestedAmount > remainingBefore) {
    throw new Error('REFUND_EXCEEDS_REMAINING');
  }

  const remainingAfter = money(remainingBefore - requestedAmount);
  const netPaid = Math.max(0, money(input.verifiedInvoicePayments - input.invoiceRefundsAfterRequest));
  const invoiceTotal = money(input.invoiceTotal);
  const fullyRefunded = netPaid === 0 && input.invoiceRefundsAfterRequest > 0;
  const invoiceStatus = fullyRefunded ? 'REFUNDED' : netPaid >= invoiceTotal ? 'PAID' : netPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
  const bookingStatus = fullyRefunded ? 'REFUNDED' : netPaid >= invoiceTotal ? 'CONFIRMED' : netPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING_PAYMENT';

  return { remainingBefore, remainingAfter, netPaid, invoiceStatus, bookingStatus };
}
