type RefundLedgerSnapshot = {
  id: string; refundNumber: string; amount: unknown; payment: { invoiceId: string };
  financialEntry: null | { id: string; refundId: string | null; invoiceId: string | null; amount: unknown; direction: string; origin: string; status: string };
};

export function refundLedgerIssue(refund: RefundLedgerSnapshot): Record<string, unknown> | null {
  const entry = refund.financialEntry;
  if (!entry) return { type: 'MISSING_REFUND_LEDGER', refundId: refund.id, refundNumber: refund.refundNumber };
  if (entry.origin !== 'REFUND' || entry.direction !== 'OUT' || entry.status !== 'POSTED' || entry.refundId !== refund.id || entry.invoiceId !== refund.payment.invoiceId || Number(entry.amount) !== Number(refund.amount)) {
    return { type: 'REFUND_LEDGER_MISMATCH', refundId: refund.id, refundNumber: refund.refundNumber, entryId: entry.id, refundAmount: Number(refund.amount), ledgerAmount: Number(entry.amount), ledgerStatus: entry.status };
  }
  return null;
}

export function orphanRefundLedgerIssue(entry: { id: string; refundId: string | null; refund: null | { refundNumber: string; status: string } }): Record<string, unknown> | null {
  if (entry.refund?.status === 'EXECUTED') return null;
  return { type: 'ORPHAN_REFUND_LEDGER', entryId: entry.id, refundId: entry.refundId, refundNumber: entry.refund?.refundNumber, refundStatus: entry.refund?.status };
}

export function invoiceRefundBalanceIssue(invoice: { id: string; invoiceNumber: string; totalAmount: unknown; paidAmount: unknown; status: string; payments: Array<{ amount: unknown; refunds: Array<{ amount: unknown }> }> }): Record<string, unknown> | null {
  const verified = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const refunded = invoice.payments.reduce((sum, payment) => sum + payment.refunds.reduce((refundSum, refund) => refundSum + Number(refund.amount), 0), 0);
  const expectedPaid = Math.max(0, verified - refunded);
  const expectedStatus = refunded > 0 && expectedPaid === 0 ? 'REFUNDED' : expectedPaid >= Number(invoice.totalAmount) ? 'PAID' : expectedPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
  if (Number(invoice.paidAmount) === expectedPaid && invoice.status === expectedStatus) return null;
  return { type: 'INVOICE_REFUND_BALANCE_MISMATCH', invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, storedPaid: Number(invoice.paidAmount), expectedPaid, storedStatus: invoice.status, expectedStatus };
}
