import { describe, expect, it, vi } from 'vitest';
import { PackagesService } from './packages.service.js';

const identity = { tenantId: 'tenant-a', userId: 'user-a', permissions: new Set<string>() } as any;

describe('PackagesService', () => {
  it('lists only active tenant-owned records', async () => {
    const prisma = {
      travelPackage: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    } as any;
    await new PackagesService(prisma).list(identity);
    expect(prisma.travelPackage.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 'tenant-a', archivedAt: null },
    }));
  });

  it('creates a package and its canonical price in one transaction', async () => {
    const tx = {
      travelPackage: { create: vi.fn().mockResolvedValue({ id: 'package-a', packageCode: 'PKG-100' }) },
      packagePrice: { create: vi.fn().mockResolvedValue({ id: 'price-a' }) },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-a' }) },
    };
    const prisma = {
      travelPackage: { findFirst: vi.fn().mockResolvedValue(null) },
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    } as any;

    const created = await new PackagesService(prisma).create(identity, {
      packageCode: 'PKG-100',
      name: 'Singapore One Day Trip',
      destination: 'Singapore',
      durationDays: 1,
      sellingPrice: 1600000,
    });

    expect(created.id).toBe('package-a');
    expect(tx.travelPackage.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 'tenant-a', packageCode: 'PKG-100', adultPrice: 1600000 }),
    });
    expect(tx.packagePrice.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ tenantId: 'tenant-a', packageId: 'package-a', sellingPrice: 1600000 }),
    });
  });

  it('archives only a package owned by the current tenant', async () => {
    const prisma = {
      travelPackage: {
        findFirst: vi.fn().mockResolvedValue({ id: 'package-a' }),
        update: vi.fn().mockResolvedValue({ id: 'package-a', status: 'ARCHIVED' }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'audit-a' }) },
    } as any;

    await expect(new PackagesService(prisma).remove(identity, 'package-a')).resolves.toEqual({ deleted: true, id: 'package-a' });
    expect(prisma.travelPackage.findFirst).toHaveBeenCalledWith({
      where: { id: 'package-a', tenantId: 'tenant-a', archivedAt: null },
      select: { id: true, approvalStatus: true },
    });
    expect(prisma.travelPackage.update).toHaveBeenCalledWith({
      where: { id: 'package-a' },
      data: { archivedAt: expect.any(Date), status: 'ARCHIVED' },
    });
  });
});
