import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerAuthService } from './customer-auth.service.js';

describe('CustomerAuthService security boundaries', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.CUSTOMER_AUTH_PROVIDER = 'local';
  });

  function service(overrides: any = {}) {
    const p: any = {
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 'tenant-a' }) },
      customerAccount: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() },
      customerSession: { findUnique: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
      booking: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
      customerBookingClaim: { upsert: vi.fn() },
      auditLog: { create: vi.fn() },
      $executeRaw: vi.fn(),
      ...overrides,
    };
    p.$transaction = vi.fn(async (work: any) => Array.isArray(work) ? Promise.all(work) : work(p));
    return { p, s: new CustomerAuthService(p, { nextCustomer: vi.fn() } as any) };
  }

  function authenticated(p: any) {
    p.customerSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      account: { id: 'account-a', active: true, customerId: 'customer-a', email: 'a@example.com', customer: { fullName: 'A' } },
    });
  }

  it('rejects expired and revoked sessions', async () => {
    const { p, s } = service();
    p.customerSession.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ expiresAt: new Date(Date.now() - 1), account: { active: true } });
    await expect(s.session('revoked')).rejects.toThrow('Session pelanggan tidak valid');
    await expect(s.session('expired')).rejects.toThrow('Session pelanggan tidak valid');
  });

  it('scopes booking list to the verified customer, claims, and tenant', async () => {
    const { p, s } = service(); authenticated(p);
    await s.bookings('token');
    expect(p.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-a', OR: [{ customerId: 'customer-a' }, { customerClaims: { some: { tenantId: 'tenant-a', accountId: 'account-a' } } }] } }));
  });

  it('rejects a claim when the verified account email differs', async () => {
    const { p, s } = service(); authenticated(p);
    await expect(s.claim('token', 'BTV-OTHER', 'other@example.com', '081234567890')).rejects.toThrow('Data klaim booking tidak cocok');
    expect(p.booking.findFirst).not.toHaveBeenCalled();
  });

  it('creates an idempotent non-destructive booking claim after matching email and phone', async () => {
    const { p, s } = service(); authenticated(p);
    p.booking.findFirst.mockResolvedValue({ id: 'booking-a', bookingCode: 'BTV-001', customerId: 'legacy-customer', customer: { email: 'a@example.com', phone: '081234567890' } });
    await expect(s.claim('token', 'btv-001', 'A@example.com', '+62 812-3456-7890')).resolves.toEqual({ claimed: true, bookingCode: 'BTV-001' });
    expect(p.customerBookingClaim.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { accountId_bookingId: { accountId: 'account-a', bookingId: 'booking-a' } } }));
    expect(p.booking.update).toBeUndefined();
  });

  it('rate limits repeated OTP requests', async () => {
    const { p, s } = service(); p.customerAccount.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 5; i++) await s.requestLogin('unknown@example.com', '127.0.0.1');
    await expect(s.requestLogin('unknown@example.com', '127.0.0.1')).rejects.toMatchObject({ status: 429 });
  });
});
