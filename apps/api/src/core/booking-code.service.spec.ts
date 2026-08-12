import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BookingCodeService } from './booking-code.service.js';

describe('BookingCodeService', () => {
  it('uses the travel month and starts at 0001', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      businessSequence: { upsert: vi.fn().mockResolvedValue({ value: 1 }) },
    } as any;

    const code = await new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-22'));

    expect(code).toBe('BTV-202612-0001');
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
    expect(tx.businessSequence.upsert).toHaveBeenCalledWith({
      where: { tenantId_scope: { tenantId: 'tenant-a', scope: 'booking:202612' } },
      create: { tenantId: 'tenant-a', scope: 'booking:202612', value: 1 },
      update: { value: { increment: 1 } },
      select: { value: true },
    });
  });

  it('increments the latest code within the same tenant and travel month', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      businessSequence: { upsert: vi.fn().mockResolvedValue({ value: 42 }) },
    } as any;

    await expect(new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-31'))).resolves.toBe('BTV-202612-0042');
  });

  it('rejects a month whose four-digit sequence is exhausted', async () => {
    const tx = {
      $executeRaw: vi.fn().mockResolvedValue(1),
      businessSequence: { upsert: vi.fn().mockResolvedValue({ value: 10000 }) },
    } as any;

    await expect(new BookingCodeService().next(tx, 'tenant-a', new Date('2026-12-01'))).rejects.toBeInstanceOf(ConflictException);
  });
});
