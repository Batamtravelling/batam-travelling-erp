import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../core/prisma.service.js';
import { RefundsService } from './refunds.module.js';

const integration = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;

integration('RefundsService database concurrency', () => {
  const prisma = new PrismaService();
  const service = new RefundsService(prisma);
  let tenantId = '';
  let userId = '';
  let paymentId = '';

  beforeAll(async () => {
    await prisma.$connect();
    const suffix = randomUUID();
    const tenant = await prisma.tenant.create({ data: { name: 'Refund Concurrency Test', slug: `refund-concurrency-${suffix}` } });
    tenantId = tenant.id;
    const user = await prisma.user.create({ data: { tenantId, email: `finance-${suffix}@example.test`, name: 'Finance Test' } });
    userId = user.id;
    const customer = await prisma.customer.create({ data: { tenantId, customerCode: 'CUS-TEST', fullName: 'Refund Customer' } });
    const booking = await prisma.booking.create({ data: { tenantId, bookingCode: 'BTV-202608-9999', customerId: customer.id, source: 'MANUAL', status: 'CONFIRMED', packageName: 'Refund Test', travelDate: new Date('2026-08-20'), pax: 1, totalAmount: 100, paidAmount: 100 } });
    const invoice = await prisma.invoice.create({ data: { tenantId, invoiceNumber: 'INV-TEST', bookingId: booking.id, customerId: customer.id, status: 'PAID', totalAmount: 100, paidAmount: 100 } });
    const payment = await prisma.payment.create({ data: { tenantId, paymentNumber: 'PAY-TEST', invoiceId: invoice.id, customerId: customer.id, amount: 100, method: 'BANK_TRANSFER', status: 'VERIFIED', receivedById: userId, verifiedById: userId, verifiedAt: new Date() } });
    paymentId = payment.id;
    await prisma.financialEntry.create({ data: { tenantId, recordedById: userId, paymentId, invoiceId: invoice.id, bookingId: booking.id, origin: 'PAYMENT', status: 'POSTED', direction: 'IN', costType: 'REVENUE', category: 'CUSTOMER_PAYMENT', description: 'Concurrency fixture', amount: 100, transactionDate: new Date(), fixedCost: false } });
  });

  afterAll(async () => {
    if (tenantId) {
      await prisma.outboxEvent.deleteMany({ where: { tenantId } });
      await prisma.auditLog.deleteMany({ where: { tenantId } });
      await prisma.financialEntry.deleteMany({ where: { tenantId } });
      await prisma.paymentRefund.deleteMany({ where: { tenantId } });
      await prisma.payment.deleteMany({ where: { tenantId } });
      await prisma.invoice.deleteMany({ where: { tenantId } });
      await prisma.booking.deleteMany({ where: { tenantId } });
      await prisma.customer.deleteMany({ where: { tenantId } });
      await prisma.businessSequence.deleteMany({ where: { tenantId } });
      await prisma.user.deleteMany({ where: { tenantId } });
      await prisma.tenant.delete({ where: { id: tenantId } });
    }
    await prisma.$disconnect();
  });

  it('serializes competing refunds and never exceeds the verified payment', async () => {
    const identity = { tenantId, userId, permissions: new Set<string>(), requestId: randomUUID() };
    const attempts = await Promise.allSettled([
      service.create(identity, paymentId, { amount: 70, method: 'BANK_TRANSFER', reason: 'Concurrent refund A' }),
      service.create(identity, paymentId, { amount: 70, method: 'BANK_TRANSFER', reason: 'Concurrent refund B' }),
    ]);

    expect(attempts.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter((result) => result.status === 'rejected')).toHaveLength(1);
    const refunds = await prisma.paymentRefund.findMany({ where: { tenantId, paymentId, status: 'POSTED' }, include: { financialEntry: true } });
    expect(refunds).toHaveLength(1);
    expect(Number(refunds[0].amount)).toBe(70);
    expect(refunds[0].financialEntry).toMatchObject({ origin: 'REFUND', direction: 'OUT', status: 'POSTED' });
    const invoice = await prisma.invoice.findFirstOrThrow({ where: { tenantId, payments: { some: { id: paymentId } } } });
    expect(Number(invoice.paidAmount)).toBe(30);
    expect(invoice.status).toBe('PARTIALLY_PAID');
  });
});
