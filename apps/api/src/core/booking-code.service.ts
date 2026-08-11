import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class BookingCodeService {
  private async lock(tx: Prisma.TransactionClient, key: string) {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${key}, 0))`;
  }

  private async nextSequence(
    tx: Prisma.TransactionClient,
    tenantId: string,
    prefix: string,
    digits: number,
    loadLatest: () => Promise<string | undefined>,
  ) {
    await this.lock(tx, `${tenantId}:${prefix}`);
    const latest = await loadLatest();
    const match = latest?.match(new RegExp(`^${prefix}(\\d{${digits}})$`));
    const sequence = Number(match?.[1] ?? 0) + 1;
    const maximum = (10 ** digits) - 1;
    if (sequence > maximum) throw new ConflictException(`Nomor ${prefix} sudah penuh`);
    return `${prefix}${String(sequence).padStart(digits, '0')}`;
  }

  async next(tx: Prisma.TransactionClient, tenantId: string, travelDate: Date) {
    const period = `${travelDate.getUTCFullYear()}${String(travelDate.getUTCMonth() + 1).padStart(2, '0')}`;
    const prefix = `BTV-${period}-`;
    return this.nextSequence(tx, tenantId, prefix, 4, async () => (
      await tx.booking.findFirst({
        where: { tenantId, bookingCode: { startsWith: prefix } },
        orderBy: { bookingCode: 'desc' },
        select: { bookingCode: true },
      })
    )?.bookingCode);
  }

  async nextCustomer(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'CUS-';
    return this.nextSequence(tx, tenantId, prefix, 6, async () => (
      await tx.customer.findFirst({ where: { tenantId, customerCode: { startsWith: prefix } }, orderBy: { customerCode: 'desc' }, select: { customerCode: true } })
    )?.customerCode);
  }

  async nextLead(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'LEAD-';
    return this.nextSequence(tx, tenantId, prefix, 6, async () => (
      await tx.lead.findFirst({ where: { tenantId, leadCode: { startsWith: prefix } }, orderBy: { leadCode: 'desc' }, select: { leadCode: true } })
    )?.leadCode);
  }

  async nextInvoice(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'INV-';
    return this.nextSequence(tx, tenantId, prefix, 6, async () => (
      await tx.invoice.findFirst({ where: { tenantId, invoiceNumber: { startsWith: prefix } }, orderBy: { invoiceNumber: 'desc' }, select: { invoiceNumber: true } })
    )?.invoiceNumber);
  }

  async nextPayment(tx: Prisma.TransactionClient, tenantId: string) {
    const prefix = 'PAY-';
    return this.nextSequence(tx, tenantId, prefix, 6, async () => (
      await tx.payment.findFirst({ where: { tenantId, paymentNumber: { startsWith: prefix } }, orderBy: { paymentNumber: 'desc' }, select: { paymentNumber: true } })
    )?.paymentNumber);
  }
}
