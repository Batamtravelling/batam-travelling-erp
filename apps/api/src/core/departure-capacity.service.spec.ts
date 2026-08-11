import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { DepartureCapacityService } from './departure-capacity.service.js';

const txFor = (sold: number, maxPax = 25) => ({
  $executeRaw: vi.fn().mockResolvedValue(1),
  packageDeparture: { findFirst: vi.fn().mockResolvedValue({ status: 'OPEN', bookingCloseAt: null, maxPax }) },
  booking: { aggregate: vi.fn().mockResolvedValue({ _sum: { pax: sold } }) },
}) as any;

describe('DepartureCapacityService', () => {
  it('allows seats after obtaining the departure lock', async () => {
    const tx = txFor(20);
    await expect(new DepartureCapacityService().assertAvailable(tx, 'tenant-a', 'departure-a', 5)).resolves.toBeUndefined();
    expect(tx.$executeRaw).toHaveBeenCalledOnce();
  });

  it('rejects a request that would oversell the departure', async () => {
    await expect(new DepartureCapacityService().assertAvailable(txFor(24), 'tenant-a', 'departure-a', 2)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a closed departure', async () => {
    const tx = txFor(0);
    tx.packageDeparture.findFirst.mockResolvedValue({ status: 'CLOSED', bookingCloseAt: null, maxPax: 25 });
    await expect(new DepartureCapacityService().assertAvailable(tx, 'tenant-a', 'departure-a', 1)).rejects.toBeInstanceOf(BadRequestException);
  });
});
