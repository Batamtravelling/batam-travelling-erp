export type SummaryLead = {
  status?: string;
  estimatedValue?: number | string | null;
  travelDate?: string | Date | null;
};

export type SummaryCustomer = {
  id: string;
};

export function buildDashboardSummary(leads: SummaryLead[], customers: SummaryCustomer[]) {
  const activeLeads = leads.filter((lead) => !['LOST', 'WON'].includes(lead.status ?? '')).length;
  const quotationLeads = leads.filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status ?? '')).length;
  const bookingLeads = leads.filter((lead) => lead.status === 'WON').length;
  const outstanding = leads
    .filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status ?? ''))
    .reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0);

  return {
    activeLeads,
    quotationLeads,
    bookingLeads,
    outstanding,
    customerCount: customers.length,
  };
}

export function buildFinanceSummary(leads: SummaryLead[]) {
  const wonLeads = leads.filter((lead) => lead.status === 'WON');
  const quotationLeads = leads.filter((lead) => ['QUOTATION', 'NEGOTIATION'].includes(lead.status ?? ''));
  const revenue = wonLeads.reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0);
  const outstanding = quotationLeads.reduce((sum, lead) => sum + Number(lead.estimatedValue ?? 0), 0);

  return { revenue, outstanding, wonCount: wonLeads.length, quotationCount: quotationLeads.length };
}

export function buildOperationsSummary(leads: SummaryLead[]) {
  const readyTrips = leads.filter((lead) => lead.status === 'WON' && Boolean(lead.travelDate)).length;
  return { readyTrips };
}
