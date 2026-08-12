import { describe, expect, it, vi } from 'vitest';
import { CustomersService } from './customers.service.js';

const identity = { tenantId: 'tenant-a', userId: 'user-a', permissions: new Set<string>(), requestId: 'request-a' };

describe('CustomersService contact integrity', () => {
  it('rejects duplicate email when updating another customer in the same tenant', async () => {
    const findFirst = vi.fn()
      .mockResolvedValueOnce({ id: 'customer-a', email: 'old@example.com', phone: '628111' })
      .mockResolvedValueOnce({ id: 'customer-b' });
    const prisma = { customer: { findFirst, update: vi.fn() } } as any;
    const service = new CustomersService(prisma, {} as any, {} as any);

    await expect(service.update(identity, 'customer-a', { email: 'DUPLICATE@EXAMPLE.COM' }))
      .rejects.toThrow('Customer dengan email atau nomor telepon tersebut sudah tersedia');

    expect(findFirst).toHaveBeenLastCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a', id: { not: 'customer-a' } }),
    }));
    expect(prisma.customer.update).not.toHaveBeenCalled();
  });

  it('allows a partial customer update without requiring fullName', async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: 'customer-a', email: null, phone: null });
    const update = vi.fn().mockResolvedValue({ id: 'customer-a', notes: 'Repeat guest' });
    const audit = { record: vi.fn().mockResolvedValue(undefined) };
    const prisma = { customer: { findFirst, update } } as any;
    const service = new CustomersService(prisma, audit as any, {} as any);

    await expect(service.update(identity, 'customer-a', { notes: 'Repeat guest' })).resolves.toEqual(
      expect.objectContaining({ notes: 'Repeat guest' }),
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ notes: 'Repeat guest', fullName: undefined }),
    }));
  });
});
