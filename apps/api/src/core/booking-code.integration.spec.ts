import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { BookingCodeService } from './booking-code.service.js';
import { PrismaService } from './prisma.service.js';

const integration = process.env.RUN_DB_INTEGRATION === 'true' ? describe : describe.skip;

integration('BookingCodeService database concurrency', () => {
  const prisma = new PrismaService();
  const service = new BookingCodeService();
  let tenantId = '';

  beforeAll(async () => {
    await prisma.$connect();
    const tenant = await prisma.tenant.create({ data: { name: 'Concurrency Test', slug: `concurrency-${randomUUID()}` } });
    tenantId = tenant.id;
  });

  afterAll(async () => {
    if (tenantId) {
      await prisma.businessSequence.deleteMany({ where: { tenantId } });
      await prisma.tenant.delete({ where: { id: tenantId } });
    }
    await prisma.$disconnect();
  });

  it('allocates unique monthly codes under simultaneous transactions', async () => {
    const travelDate = new Date('2026-12-22T00:00:00.000Z');
    const codes = await Promise.all(Array.from({ length: 25 }, () => prisma.$transaction((tx) => service.next(tx, tenantId, travelDate))));

    expect(new Set(codes).size).toBe(25);
    expect(codes.every((code) => /^BTV-202612-\d{4}$/.test(code))).toBe(true);
  });
});
