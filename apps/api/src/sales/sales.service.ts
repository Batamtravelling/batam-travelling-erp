import { buildBookingRecord, buildQuotationRecord, type SalesLeadLike } from './quote-helpers.js';

export class SalesService {
  private readonly leads: SalesLeadLike[] = [
    {
      id: 'lead-1',
      leadCode: 'LEAD-000001',
      source: 'Website',
      destination: 'Bintan',
      pax: 4,
      estimatedValue: 1200000,
      status: 'QUOTATION',
      customer: { fullName: 'Rina' },
    },
    {
      id: 'lead-2',
      leadCode: 'LEAD-000002',
      source: 'Instagram',
      destination: 'Batam',
      pax: 2,
      estimatedValue: 950000,
      status: 'WON',
      customer: { fullName: 'Budi' },
    },
  ];

  getQuotations() {
    return this.leads.filter((lead) => lead.status === 'QUOTATION' || lead.status === 'NEGOTIATION').map(buildQuotationRecord);
  }

  getBookings() {
    return this.leads.filter((lead) => lead.status === 'WON').map(buildBookingRecord);
  }
}
