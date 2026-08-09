import { describe, expect, it } from 'vitest';
import { SalesService } from './sales.service.js';

describe('SalesService', () => {
  it('builds quotations and bookings from lead-like records', () => {
    const service = new SalesService();

    const quotations = service.getQuotations();
    const bookings = service.getBookings();

    expect(quotations[0].quoteCode).toBe('QT-000001');
    expect(quotations[0].customerName).toBe('Rina');
    expect(bookings[0].bookingCode).toBe('BK-000002');
    expect(bookings[0].status).toBe('Confirmed');
  });
});
