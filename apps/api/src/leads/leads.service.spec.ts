import { describe, expect, it, vi } from 'vitest';
import { canTransitionLead, LeadsService, validateLeadTransition } from './leads.service.js';

describe('lead state transitions', () => {
  it('allows the supported sales path', () => {
    expect(canTransitionLead('NEW', 'CONTACTED')).toBe(true);
    expect(canTransitionLead('CONTACTED', 'QUALIFIED')).toBe(true);
    expect(canTransitionLead('QUALIFIED', 'QUOTATION')).toBe(true);
    expect(canTransitionLead('QUOTATION', 'WON')).toBe(true);
  });

  it('rejects skipping states and transitions from terminal states', () => {
    expect(canTransitionLead('NEW', 'WON')).toBe(false);
    expect(canTransitionLead('WON', 'CONTACTED')).toBe(false);
    expect(canTransitionLead('LOST', 'NEW')).toBe(false);
  });

  it('requires a reason when closing a lead as lost', () => {
    expect(() => validateLeadTransition('NEW', 'LOST', 'Customer declined')).not.toThrow();
    expect(() => validateLeadTransition('NEW', 'LOST')).toThrow('A reason is required when marking a lead as lost');
  });
});


describe('lead tenant reference validation', () => {
  const identity = { tenantId: 'tenant-a', userId: 'user-a', permissions: new Set<string>(), requestId: 'request-a' };

  it('rejects assigning a lead to a user outside the active tenant', async () => {
    const prisma = {
      user: { findFirst: vi.fn().mockResolvedValue(null) },
    } as any;
    const service = new LeadsService(prisma, {} as any, {} as any);

    await expect(service.create(identity, {
      senderName: 'Tamu',
      phone: '628123456789',
      source: 'WHATSAPP',
      assignedUserId: '00000000-0000-4000-8000-000000000099',
    })).rejects.toThrow('Petugas lead tidak valid atau tidak aktif');
    expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a', active: true }),
    }));
  });
});


describe('tenant-wide follow-up agenda', () => {
  const identity = { tenantId: 'tenant-a', userId: 'user-a', permissions: new Set<string>(), requestId: 'request-a' };

  it('scopes and paginates follow-ups independently from the current lead page', async () => {
    const count = vi.fn().mockResolvedValue(21);
    const findMany = vi.fn().mockResolvedValue([{ id: 'follow-up-a' }]);
    const prisma = { followUp: { count, findMany } } as any;
    const service = new LeadsService(prisma, {} as any, {} as any);

    const result = await service.listFollowUps(identity, { page: 2, pageSize: 10, search: 'Bintan' });

    expect(count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-a' }) }));
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 10, where: expect.objectContaining({ tenantId: 'tenant-a' }) }));
    expect(result.meta).toEqual({ page: 2, pageSize: 10, total: 21, totalPages: 3 });
  });
});
