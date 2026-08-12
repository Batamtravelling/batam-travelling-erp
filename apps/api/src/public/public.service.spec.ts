import { describe, expect, it, vi } from 'vitest';
import { PublicService } from './public.module.js';

describe('PublicService booking portal', () => {
  it('returns an allow-listed customer view without internal notes or tenant identifiers', async () => {
    const prisma = {
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 'tenant-a' }) },
      booking: { findFirst: vi.fn().mockResolvedValue({
        id: 'booking-a', tenantId: 'tenant-a', bookingCode: 'BTV-202608-0001', status: 'CONFIRMED',
        packageName: 'Batam Weekend', travelDate: new Date('2026-08-20'), returnDate: null, pax: 2,
        totalAmount: 2_000_000, paidAmount: 1_000_000, notes: 'INTERNAL PRICE OVERRIDE',
        customer: { fullName: 'Customer', phone: '081234567890', email: 'customer@example.com', notes: 'PRIVATE' },
        package: null,
        items: [{ id: 'item-a', tenantId: 'tenant-a', bookingId: 'booking-a', name: 'Tour', category: 'PACKAGE', quantity: 2, unit: 'pax', unitPrice: 1_000_000, totalPrice: 2_000_000, serviceDate: null, notes: 'INTERNAL ITEM NOTE' }],
        departure: null,
        invoice: { tenantId: 'tenant-a', customerId: 'customer-a', invoiceNumber: 'INV-000001', status: 'PARTIALLY_PAID', issuedAt: new Date(), dueDate: null, totalAmount: 2_000_000, paidAmount: 1_000_000, payments: [] },
        trip: { id: 'trip-a', tripCode: 'TRIP-000001', title: 'Trip', status: 'READY', startsAt: new Date(), endsAt: new Date(), meetingPoint: 'Harbour', vehicle: null, itinerary: 'Public itinerary', notes: 'INTERNAL TRIP NOTE', assignments: [{ role: 'GUIDE', status: 'CONFIRMED', taskNote: 'INTERNAL TASK', employee: { name: 'Guide', jobTitle: 'Guide' } }] },
      }) },
    };
    const service = new PublicService(prisma as any, {} as any, {} as any);

    const result = await service.booking({ bookingCode: 'btv-202608-0001', phone: '081234567890' });
    const serialized = JSON.stringify(result);

    expect(result.customer.phone).toBe('0812***90');
    expect(serialized).not.toContain('INTERNAL');
    expect(serialized).not.toContain('tenant-a');
    expect(serialized).not.toContain('customer-a');
  });
});
