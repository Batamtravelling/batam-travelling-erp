import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../core/prisma.service.js';
import { RefundsService } from './refunds.module.js';

const integration = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;
const permissions = (...codes: string[]) => new Set(codes);

integration('RefundsService governed lifecycle', () => {
  const prisma = new PrismaService();
  const service = new RefundsService(prisma);
  const ids: Record<string, string> = {};
  let sequence = 0;

  const identity = (tenantId: string, userId: string, ...codes: string[]) => ({ tenantId, userId, permissions: permissions(...codes), requestId: randomUUID() });
  const requester = () => identity(ids.tenantA, ids.requesterA, 'refund.request', 'refund.view');
  const manager = () => identity(ids.tenantA, ids.managerA, 'refund.approve.manager', 'refund.reject', 'refund.view');
  const owner = () => identity(ids.tenantA, ids.ownerA, 'refund.approve.owner', 'refund.reject', 'refund.view');
  const processor = () => identity(ids.tenantA, ids.processorA, 'refund.process', 'refund.view');

  async function createPayment(amount = 10_000_000, method: 'BANK_TRANSFER' | 'CASH' | 'QRIS' | 'OTHER' = 'BANK_TRANSFER') {
    sequence += 1;
    const booking = await prisma.booking.create({ data: { tenantId: ids.tenantA, bookingCode: `BTV-202608-${String(9000 + sequence)}`, customerId: ids.customerA, source: 'MANUAL', status: 'CONFIRMED', packageName: 'Refund Test', travelDate: new Date('2026-08-20'), pax: 1, totalAmount: amount, paidAmount: amount } });
    const invoice = await prisma.invoice.create({ data: { tenantId: ids.tenantA, invoiceNumber: `INV-TEST-${sequence}`, bookingId: booking.id, customerId: ids.customerA, status: 'PAID', totalAmount: amount, paidAmount: amount } });
    const payment = await prisma.payment.create({ data: { tenantId: ids.tenantA, paymentNumber: `PAY-TEST-${sequence}`, invoiceId: invoice.id, customerId: ids.customerA, amount, method, status: 'VERIFIED', receivedById: ids.processorA, verifiedById: ids.managerA, verifiedAt: new Date() } });
    await prisma.financialEntry.create({ data: { tenantId: ids.tenantA, recordedById: ids.processorA, paymentId: payment.id, invoiceId: invoice.id, bookingId: booking.id, origin: 'PAYMENT', status: 'POSTED', direction: 'IN', costType: 'REVENUE', category: 'CUSTOMER_PAYMENT', description: 'Refund fixture', amount, transactionDate: new Date(), fixedCost: false } });
    return payment;
  }

  beforeAll(async () => {
    await prisma.$connect();
    const suffix = randomUUID();
    const tenantA = await prisma.tenant.create({ data: { name: 'Refund Tenant A', slug: `refund-a-${suffix}` } });
    const tenantB = await prisma.tenant.create({ data: { name: 'Refund Tenant B', slug: `refund-b-${suffix}` } });
    ids.tenantA = tenantA.id; ids.tenantB = tenantB.id;
    await prisma.tenantRefundPolicy.createMany({ data: [{ tenantId: ids.tenantA, managerApprovalLimit: 5_000_000 }, { tenantId: ids.tenantB, managerApprovalLimit: 5_000_000 }] });
    for (const name of ['requesterA', 'managerA', 'ownerA', 'processorA']) {
      const user = await prisma.user.create({ data: { tenantId: ids.tenantA, email: `${name}-${suffix}@example.test`, name } }); ids[name] = user.id;
    }
    for (const name of ['managerB', 'processorB']) {
      const user = await prisma.user.create({ data: { tenantId: ids.tenantB, email: `${name}-${suffix}@example.test`, name } }); ids[name] = user.id;
    }
    const customer = await prisma.customer.create({ data: { tenantId: ids.tenantA, customerCode: 'CUS-REFUND', fullName: 'Refund Customer' } }); ids.customerA = customer.id;
  });

  afterAll(async () => {
    for (const tenantId of [ids.tenantA, ids.tenantB]) if (tenantId) {
      await prisma.idempotencyRecord.deleteMany({ where: { tenantId } });
      await prisma.outboxEvent.deleteMany({ where: { tenantId } });
      await prisma.auditLog.deleteMany({ where: { tenantId } });
      await prisma.financialEntry.deleteMany({ where: { tenantId } });
      await prisma.paymentRefund.deleteMany({ where: { tenantId } });
      await prisma.payment.deleteMany({ where: { tenantId } });
      await prisma.invoice.deleteMany({ where: { tenantId } });
      await prisma.booking.deleteMany({ where: { tenantId } });
      await prisma.customer.deleteMany({ where: { tenantId } });
      await prisma.businessSequence.deleteMany({ where: { tenantId } });
      await prisma.tenantRefundPolicy.deleteMany({ where: { tenantId } });
      await prisma.user.deleteMany({ where: { tenantId } });
      await prisma.tenant.delete({ where: { id: tenantId } });
    }
    await prisma.$disconnect();
  });

  it('rejects unauthorized request, approval, and execution', async () => {
    const payment = await createPayment();
    const none = identity(ids.tenantA, ids.requesterA);
    await expect(service.request(none, payment.id, { amount: 100, reason: 'No permission' })).rejects.toThrow('Permission denied');
    await expect(service.approveManager(none, randomUUID(), { reason: 'No permission' })).rejects.toThrow('Permission denied');
    await expect(service.execute(none, randomUUID(), { reference: 'REF', proofUrl: 'proof' }, 'unauth-key')).rejects.toThrow('Permission denied');
  });

  it('enforces tenant scope for request read, approval, rejection, and execution', async () => {
    const payment = await createPayment();
    const refund = await service.request(requester(), payment.id, { amount: 100, reason: 'Tenant scope' });
    const managerB = identity(ids.tenantB, ids.managerB, 'refund.view', 'refund.approve.manager', 'refund.reject');
    const processorB = identity(ids.tenantB, ids.processorB, 'refund.process');
    await expect(service.request(identity(ids.tenantB, ids.processorB, 'refund.request'), payment.id, { amount: 100, reason: 'Cross tenant' })).rejects.toThrow('Payment tidak ditemukan');
    await expect(service.get(managerB, refund.id)).rejects.toThrow('Refund request tidak ditemukan');
    await expect(service.approveManager(managerB, refund.id, { reason: 'Cross tenant' })).rejects.toThrow('Refund request tidak ditemukan');
    await expect(service.reject(managerB, refund.id, { reason: 'Cross tenant' })).rejects.toThrow('Refund request tidak ditemukan');
    await expect(service.execute(processorB, refund.id, { reference: 'REF', proofUrl: 'proof' }, 'cross-tenant-key')).rejects.toThrow('Refund request tidak ditemukan');
  });

  it('prevents requester self-approval and requires manager approval for a partial refund', async () => {
    const payment = await createPayment(1_000_000);
    const refund = await service.request(requester(), payment.id, { amount: 250_000, reason: 'Partial refund' });
    await expect(service.approveManager(identity(ids.tenantA, ids.requesterA, 'refund.approve.manager'), refund.id, { reason: 'Self approve' })).rejects.toThrow('Requester tidak boleh');
    await expect(service.execute(processor(), refund.id, { reference: 'PREMATURE', proofUrl: 'proof' }, 'partial-before-approval')).rejects.toThrow('persetujuan');
    const approved = await service.approveManager(manager(), refund.id, { reason: 'Partial approved' });
    expect(approved.status).toBe('MANAGER_APPROVED');
    const result = await service.execute(processor(), refund.id, { reference: 'PARTIAL-REF', proofUrl: 'proof://partial' }, 'partial-approved-key');
    expect(result).toMatchObject({ status: 'EXECUTED', remainingRefundable: 750_000 });
  });

  it('requires sequential Manager then Owner approval above Rp5,000,000', async () => {
    const payment = await createPayment(10_000_000);
    const refund = await service.request(requester(), payment.id, { amount: 5_000_001, reason: 'Large refund' });
    expect(refund.requiresOwnerApproval).toBe(true);
    await expect(service.approveOwner(owner(), refund.id, { reason: 'Owner too early' })).rejects.toThrow('Finance Manager');
    await service.approveManager(manager(), refund.id, { reason: 'Manager checked' });
    await expect(service.execute(processor(), refund.id, { reference: 'NO-OWNER', proofUrl: 'proof' }, 'large-no-owner')).rejects.toThrow('persetujuan');
    const ownerApproved = await service.approveOwner(owner(), refund.id, { reason: 'Owner approved' });
    expect(ownerApproved.status).toBe('OWNER_APPROVED');
    const result = await service.execute(processor(), refund.id, { reference: 'LARGE-REF', proofUrl: 'proof://large' }, 'large-owner-approved');
    expect(result.status).toBe('EXECUTED');
  });

  it('requires Manager then Owner for policy exceptions even below threshold', async () => {
    const payment = await createPayment(1_000_000);
    const refund = await service.request(requester(), payment.id, { amount: 100_000, reason: 'Exception', isException: true, exceptionReason: 'Policy override' });
    expect(refund.requiresOwnerApproval).toBe(true);
    await service.approveManager(manager(), refund.id, { reason: 'Manager exception review' });
    await service.approveOwner(owner(), refund.id, { reason: 'Owner exception approval' });
    expect((await service.execute(processor(), refund.id, { reference: 'EXCEPTION', proofUrl: 'proof://exception' }, 'exception-approved')).status).toBe('EXECUTED');
  });

  it('defaults to original method and controls alternate refund method', async () => {
    const payment = await createPayment(1_000_000, 'BANK_TRANSFER');
    await expect(service.request(requester(), payment.id, { amount: 100_000, method: 'CASH', reason: 'Alternate method' })).rejects.toThrow('Alasan perubahan metode');
    const refund = await service.request(requester(), payment.id, { amount: 100_000, method: 'CASH', reason: 'Alternate method', methodChangeReason: 'Bank account closed' });
    expect(refund.method).toBe('CASH');
    await service.approveManager(manager(), refund.id, { reason: 'Approve alternate method' });
    const result = await service.execute(processor(), refund.id, { reference: 'CASH-REF', proofUrl: 'proof://cash' }, 'alternate-method-key');
    expect(result.method).toBe('CASH');
    const audit = await prisma.auditLog.findFirstOrThrow({ where: { tenantId: ids.tenantA, resourceId: refund.id, action: 'refund.requested' } });
    expect(audit.metadata).toMatchObject({ originalMethod: 'BANK_TRANSFER', methodChangeReason: 'Bank account closed' });
  });

  it('replays the same idempotency key and rejects a different key after execution', async () => {
    const payment = await createPayment(1_000_000);
    const refund = await service.request(requester(), payment.id, { amount: 100_000, reason: 'Idempotency' });
    await service.approveManager(manager(), refund.id, { reason: 'Approved' });
    const payload = { reference: 'IDEM-REF', proofUrl: 'proof://idem' };
    const first = await service.execute(processor(), refund.id, payload, 'same-idempotency-key');
    const replay = await service.execute(processor(), refund.id, payload, 'same-idempotency-key');
    expect(replay).toEqual(first);
    await expect(service.execute(processor(), refund.id, payload, 'different-idempotency-key')).rejects.toThrow('sudah dieksekusi');
    expect(await prisma.financialEntry.count({ where: { tenantId: ids.tenantA, refundId: refund.id } })).toBe(1);
    expect(await prisma.auditLog.count({ where: { tenantId: ids.tenantA, resourceId: refund.id, action: 'refund.executed' } })).toBe(1);
    expect(await prisma.outboxEvent.count({ where: { tenantId: ids.tenantA, aggregateId: refund.id, eventType: 'refund.executed' } })).toBe(1);
  });

  it('serializes two parallel executions into one refund and one OUT ledger', async () => {
    const payment = await createPayment(1_000_000);
    const refund = await service.request(requester(), payment.id, { amount: 100_000, reason: 'Parallel execution' });
    await service.approveManager(manager(), refund.id, { reason: 'Approved' });
    const payload = { reference: 'PARALLEL', proofUrl: 'proof://parallel' };
    const attempts = await Promise.all([service.execute(processor(), refund.id, payload, 'parallel-same-key'), service.execute(processor(), refund.id, payload, 'parallel-same-key')]);
    expect(attempts[0]).toEqual(attempts[1]);
    expect(await prisma.paymentRefund.count({ where: { id: refund.id, tenantId: ids.tenantA, status: 'EXECUTED' } })).toBe(1);
    expect(await prisma.financialEntry.count({ where: { tenantId: ids.tenantA, refundId: refund.id, direction: 'OUT' } })).toBe(1);
  });

  it('serializes parallel requests that could over-refund a payment', async () => {
    const payment = await createPayment(100);
    const attempts = await Promise.allSettled([service.request(requester(), payment.id, { amount: 70, reason: 'Parallel A' }), service.request(requester(), payment.id, { amount: 70, reason: 'Parallel B' })]);
    expect(attempts.filter(result => result.status === 'fulfilled')).toHaveLength(1);
    expect(attempts.filter(result => result.status === 'rejected')).toHaveLength(1);
    expect(await prisma.paymentRefund.count({ where: { tenantId: ids.tenantA, paymentId: payment.id } })).toBe(1);
  });

  it('keeps executed and rejected refund records immutable', async () => {
    const payment = await createPayment(1_000_000);
    const executed = await service.request(requester(), payment.id, { amount: 100_000, reason: 'Execute immutable' });
    await service.approveManager(manager(), executed.id, { reason: 'Approved' });
    await service.execute(processor(), executed.id, { reference: 'IMMUTABLE', proofUrl: 'proof://immutable' }, 'immutable-execution');
    await expect(service.reject(manager(), executed.id, { reason: 'Too late' })).rejects.toThrow('tidak dapat ditolak');
    await expect(service.approveManager(manager(), executed.id, { reason: 'Too late' })).rejects.toThrow('tidak menunggu');
    const rejected = await service.request(requester(), payment.id, { amount: 50_000, reason: 'Reject immutable' });
    await service.reject(manager(), rejected.id, { reason: 'Rejected' });
    await expect(service.execute(processor(), rejected.id, { reference: 'NO', proofUrl: 'proof' }, 'rejected-execution')).rejects.toThrow('persetujuan');
  });
});
