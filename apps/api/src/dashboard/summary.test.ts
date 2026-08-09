import { describe, expect, it } from 'vitest';
import { buildDashboardSummary, buildFinanceSummary, buildOperationsSummary } from './summary.js';

describe('dashboard summary helpers', () => {
  it('derives dashboard metrics from leads and customers', () => {
    const leads = [
      { status: 'QUOTATION', estimatedValue: 1000000, travelDate: '2026-08-10' },
      { status: 'WON', estimatedValue: 5000000, travelDate: '2026-08-12' },
      { status: 'LOST', estimatedValue: 2000000 },
    ];
    const customers = [{ id: '1' }, { id: '2' }];

    const summary = buildDashboardSummary(leads as any, customers as any);

    expect(summary.activeLeads).toBe(1);
    expect(summary.quotationLeads).toBe(1);
    expect(summary.bookingLeads).toBe(1);
    expect(summary.customerCount).toBe(2);
  });

  it('derives finance and operations summaries', () => {
    const leads = [
      { status: 'QUOTATION', estimatedValue: 1500000 },
      { status: 'WON', estimatedValue: 2500000, travelDate: '2026-08-14' },
    ];

    const finance = buildFinanceSummary(leads as any);
    const operations = buildOperationsSummary(leads as any);

    expect(finance.outstanding).toBe(1500000);
    expect(finance.revenue).toBe(2500000);
    expect(operations.readyTrips).toBe(1);
  });
});
