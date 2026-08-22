import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { quotationItemsRequireRepricing, SalesService } from './sales.service.js';

const identity = { tenantId: 'tenant-a', userId: 'user-a', permissions: new Set<string>(), requestId: 'request-a' };

describe('SalesService quotation isolation', () => {
  it('scopes quotation lists to the authenticated tenant and paginates', async () => {
    const count = vi.fn().mockResolvedValue(1);
    const findMany = vi.fn().mockResolvedValue([{ id: 'quotation-a' }]);
    const prisma = { quotation: { count, findMany } } as any;
    const service = new SalesService(prisma, {} as any, {} as any);

    const result = await service.list(identity, { page: 2, pageSize: 10, search: 'Bintan' });

    expect(count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-a' }) }));
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10, where: expect.objectContaining({ tenantId: 'tenant-a' }) }));
    expect(result.meta).toEqual({ page: 2, pageSize: 10, total: 1, totalPages: 1 });
  });

  it('does not return a quotation outside the tenant scope', async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const service = new SalesService({ quotation: { findFirst } } as any, {} as any, {} as any);

    await expect(service.find(identity, 'quotation-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'quotation-b', tenantId: 'tenant-a' } }));
  });
});


describe('quotation item repricing', () => {
  it('recalculates package items when pax changes', () => {
    expect(quotationItemsRequireRepricing({
      itemsProvided: false,
      packageChanged: false,
      paxChanged: true,
      hasPackage: true,
    })).toBe(true);
  });

  it('preserves custom item totals when only pax changes', () => {
    expect(quotationItemsRequireRepricing({
      itemsProvided: false,
      packageChanged: false,
      paxChanged: true,
      hasPackage: false,
    })).toBe(false);
  });

  it('recalculates items when the canonical departure changes', () => {
    expect(quotationItemsRequireRepricing({ itemsProvided: false, packageChanged: false, paxChanged: false, hasPackage: true, departureChanged: true })).toBe(true);
  });
});
