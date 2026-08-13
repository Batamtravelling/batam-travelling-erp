type VerifiedPaymentLedgerSource<TAmount> = {
  tenantId: string;
  recordedById: string;
  paymentId: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  bookingId: string;
  amount: TAmount;
  receivedAt: Date;
  reference?: string | null;
};

type PaymentRefundLedgerSource<TAmount> = {
  tenantId: string;
  recordedById: string;
  refundId: string;
  refundNumber: string;
  paymentId: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  bookingId: string;
  amount: TAmount;
  refundedAt: Date;
  reference?: string | null;
  reason: string;
};

export function buildVerifiedPaymentLedgerEntry<TAmount>(source: VerifiedPaymentLedgerSource<TAmount>) {
  return {
    tenantId: source.tenantId,
    recordedById: source.recordedById,
    paymentId: source.paymentId,
    invoiceId: source.invoiceId,
    bookingId: source.bookingId,
    origin: 'PAYMENT' as const,
    status: 'POSTED' as const,
    direction: 'IN' as const,
    costType: 'REVENUE' as const,
    category: 'CUSTOMER_PAYMENT',
    description: `Pembayaran ${source.paymentNumber} untuk invoice ${source.invoiceNumber}`,
    amount: source.amount,
    transactionDate: source.receivedAt,
    reference: source.reference || source.paymentNumber,
    fixedCost: false,
    notes: 'Dibuat otomatis saat pembayaran diverifikasi',
  };
}

export function buildPaymentRefundLedgerEntry<TAmount>(source: PaymentRefundLedgerSource<TAmount>) {
  return {
    tenantId: source.tenantId,
    recordedById: source.recordedById,
    refundId: source.refundId,
    invoiceId: source.invoiceId,
    bookingId: source.bookingId,
    origin: 'REFUND' as const,
    status: 'POSTED' as const,
    direction: 'OUT' as const,
    costType: 'REVENUE' as const,
    category: 'CUSTOMER_REFUND',
    description: `Refund ${source.refundNumber} untuk pembayaran ${source.paymentNumber} / invoice ${source.invoiceNumber}`,
    amount: source.amount,
    transactionDate: source.refundedAt,
    reference: source.reference || source.refundNumber,
    fixedCost: false,
    notes: source.reason,
  };
}
