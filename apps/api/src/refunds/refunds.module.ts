import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { buildPaymentRefundLedgerEntry } from '../core/financial-ledger.js';
import { evaluateRefundLifecycle } from '../core/refund-policy.js';

class CreateRefundDto {
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsString() @MaxLength(1000) reason!: string;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
}

@Injectable()
export class RefundsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private async nextRefundNumber(tx: Prisma.TransactionClient, tenantId: string) {
    const rows = await tx.$queryRaw<Array<{ value: number }>>(Prisma.sql`
      INSERT INTO "business_sequences" ("id", "tenant_id", "scope", "value", "created_at", "updated_at")
      VALUES (${randomUUID()}::uuid, ${tenantId}::uuid, 'refund', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("tenant_id", "scope") DO UPDATE
      SET "value" = "business_sequences"."value" + 1, "updated_at" = CURRENT_TIMESTAMP
      RETURNING "value"
    `);
    return `RFD-${String(rows[0].value).padStart(6, '0')}`;
  }

  async listForPayment(i: RequestIdentity, paymentId: string) {
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, tenantId: i.tenantId }, select: { id: true } });
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');
    return this.prisma.paymentRefund.findMany({ where: { tenantId: i.tenantId, paymentId }, orderBy: { refundedAt: 'desc' } });
  }

  async create(i: RequestIdentity, paymentId: string, d: CreateRefundDto) {
    const reason = d.reason.trim();
    if (!reason) throw new BadRequestException('Alasan refund wajib diisi');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment-refund:${paymentId}`}))`;
      const payment = await tx.payment.findFirst({
        where: { id: paymentId, tenantId: i.tenantId },
        include: { invoice: { select: { id: true, invoiceNumber: true, bookingId: true, totalAmount: true } }, financialEntry: { select: { id: true, origin: true, status: true, direction: true } } },
      });
      if (!payment) throw new NotFoundException('Payment tidak ditemukan');
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`invoice-refund:${payment.invoiceId}`}))`;
      if (payment.status !== 'VERIFIED') throw new BadRequestException('Hanya payment VERIFIED yang dapat direfund');
      if (!payment.financialEntry || payment.financialEntry.origin !== 'PAYMENT' || payment.financialEntry.status !== 'POSTED' || payment.financialEntry.direction !== 'IN') {
        throw new BadRequestException('Canonical ledger payment tidak valid; jalankan reconciliation sebelum refund');
      }

      const refunded = await tx.paymentRefund.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, paymentId: payment.id, status: 'POSTED' } });
      const alreadyRefunded = Number(refunded._sum.amount ?? 0);

      const refundId = randomUUID();
      const refundNumber = await this.nextRefundNumber(tx, i.tenantId);
      const refundedAt = new Date();
      await tx.paymentRefund.create({ data: { id: refundId, tenantId: i.tenantId, paymentId: payment.id, refundNumber, amount: d.amount, method: d.method, status: 'POSTED', reason, reference: d.reference, processedById: i.userId, refundedAt } });
      await tx.financialEntry.create({ data: buildPaymentRefundLedgerEntry({ tenantId: i.tenantId, recordedById: i.userId, refundId, refundNumber, paymentId: payment.id, paymentNumber: payment.paymentNumber, invoiceId: payment.invoiceId, invoiceNumber: payment.invoice.invoiceNumber, bookingId: payment.invoice.bookingId, amount: new Prisma.Decimal(d.amount), refundedAt, reference: d.reference, reason }) });

      const verified = await tx.payment.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, invoiceId: payment.invoiceId, status: 'VERIFIED' } });
      const invoiceRefunds = await tx.paymentRefund.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, payment: { invoiceId: payment.invoiceId }, status: 'POSTED' } });
      let lifecycle;
      try {
        lifecycle = evaluateRefundLifecycle({ paymentAmount: Number(payment.amount), alreadyRefunded, requestedAmount: d.amount, invoiceTotal: Number(payment.invoice.totalAmount), verifiedInvoicePayments: Number(verified._sum.amount ?? 0), invoiceRefundsAfterRequest: Number(invoiceRefunds._sum.amount ?? 0) });
      } catch (error) {
        if (error instanceof Error && error.message === 'REFUND_EXCEEDS_REMAINING') throw new BadRequestException(`Refund melebihi sisa refundable payment (${Number(payment.amount) - alreadyRefunded})`);
        throw error;
      }
      const { netPaid, invoiceStatus, bookingStatus, remainingAfter } = lifecycle;
      await tx.invoice.update({ where: { id: payment.invoiceId }, data: { paidAmount: netPaid, status: invoiceStatus } });
      await tx.booking.update({ where: { id: payment.invoice.bookingId }, data: { paidAmount: netPaid, status: bookingStatus } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'payment.refunded', resourceType: 'PaymentRefund', resourceId: refundId, requestId: i.requestId, metadata: { paymentId: payment.id, paymentNumber: payment.paymentNumber, invoiceId: payment.invoiceId, refundNumber, amount: d.amount, method: d.method, reason, netPaid } } });
      await tx.outboxEvent.create({ data: { tenantId: i.tenantId, eventType: 'payment.refunded', aggregateType: 'payment', aggregateId: payment.id, payload: { event_id: randomUUID(), event_type: 'payment.refunded', tenant_id: i.tenantId, actor_id: i.userId, aggregate_type: 'payment', aggregate_id: payment.id, schema_version: 1, refund_id: refundId, refund_number: refundNumber, amount: d.amount } } });

      return { id: refundId, refundNumber, paymentId: payment.id, amount: d.amount, method: d.method, status: 'POSTED', reason, reference: d.reference ?? null, refundedAt, remainingRefundable: remainingAfter, invoice: { id: payment.invoiceId, paidAmount: netPaid, status: invoiceStatus } };
    });
  }
}

@UseGuards(IdentityGuard, PermissionGuard)
@Controller('payments')
class RefundsController {
  constructor(@Inject(RefundsService) private readonly refunds: RefundsService) {}
  @Get(':id/refunds') @Permissions('payment.read') list(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string) { return this.refunds.listForPayment(i, id); }
  @Post(':id/refunds') @Permissions('payment.manage') create(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string, @Body() d: CreateRefundDto) { return this.refunds.create(i, id, d); }
}

@Module({ controllers: [RefundsController], providers: [RefundsService, PrismaService, IdentityGuard, PermissionGuard], exports: [RefundsService] })
export class RefundsModule {}
