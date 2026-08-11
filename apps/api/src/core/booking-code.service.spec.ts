import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BookingCodeService } from './booking-code.service.js';

describe('BookingCodeService', () => {
  it('uses the travel month and starts at 0001', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      booking: { findFirst: vi.fn().mockResolvedValue(null) },
    } as any;

    const code = await new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-22'));

    expect(code).toBe('BTV-202612-0001');
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
    expect(tx.booking.findFirst).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-a', bookingCode: { startsWith: 'BTV-202612-' } },
      orderBy: { bookingCode: 'desc' },
      select: { bookingCode: true },
    });
  });

  it('increments the latest code within the same tenant and travel month', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      booking: { findFirst: vi.fn().mockResolvedValue({ bookingCode: 'BTV-202612-0041' }) },
    } as any;

    await expect(new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-31'))).resolves.toBe('BTV-202612-0042');
  });

  it('rejects a month whose four-digit sequence is exhausted', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      booking: { findFirst: vi.fn().mockResolvedValue({ bookingCode: 'BTV-202612-9999' }) },
    } as any;

    await expect(new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-01'))).rejects.toBeInstanceOf(ConflictException);
  });
});
