export type SalesLeadLike = {
  id: string;
  leadCode: string;
  source: string;
  destination?: string | null;
  pax?: number | null;
  estimatedValue?: number | null;
  status?: string;
  customer?: { fullName?: string | null };
};

export function buildQuotationRecord(lead: SalesLeadLike) {
  return {
    quoteCode: `QT-${lead.leadCode.replace('LEAD-', '')}`,
    customerName: lead.customer?.fullName ?? 'Unknown',
    destination: lead.destination ?? '—',
    totalPax: lead.pax ?? 0,
    estimatedValue: lead.estimatedValue ?? 0,
    status: lead.status ?? 'QUOTATION',
  };
}

export function buildBookingRecord(lead: SalesLeadLike) {
  return {
    bookingCode: `BK-${lead.leadCode.replace('LEAD-', '')}`,
    customerName: lead.customer?.fullName ?? 'Unknown',
    destination: lead.destination ?? '—',
    totalPax: lead.pax ?? 0,
    status: lead.status === 'WON' ? 'Confirmed' : 'Pending',
  };
}
