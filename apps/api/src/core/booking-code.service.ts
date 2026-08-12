import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingCodeService {
  private async lock(tx: Prisma.TransactionClient, key: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  }

  private async nextSequence(tx: Prisma.TransactionClient, tenantId: string, scope: string, prefix: string, digits: number) {
    await this.lock(tx, `${tenantId}:${scope}`);
    const row = await tx.businessSequence.upsert({
      where: { tenantId_scope: { tenantId, scope } },
      create: { tenantId, scope, value: 1 },
      update: { value: { increment: 1 } },
      select: { value: true },
    });
    const sequence = row.value;
    const maximum = (10 ** digits) - 1;
    if (sequence > maximum) throw new ConflictException(`Nomor ${prefix} sudah penuh`);
    return `${prefix}${String(sequence).padStart(digits, '0')}`;
  }

  async next(tx: Prisma.TransactionClient, tenantId: string, travelDate: Date) {
    const period = `${travelDate.getUTCFullYear()}${String(travelDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const prefix = `BTV-${period}-`;
    return this.nextSequence(tx, tenantId, `booking:${period}`, prefix, 4);
  }

  async nextCustomer(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'CUS-';
    return this.nextSequence(tx, tenantId, 'customer', prefix, 6);
  }

  async nextLead(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'LEAD-';
    return this.nextSequence(tx, tenantId, 'lead', prefix, 6);
  }

  async nextInvoice(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'INV-';
    return this.nextSequence(tx, tenantId, 'invoice', prefix, 6);
  }

  async nextPayment(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'PAY-';
    return this.nextSequence(tx, tenantId, 'payment', prefix, 6);
  }
}
