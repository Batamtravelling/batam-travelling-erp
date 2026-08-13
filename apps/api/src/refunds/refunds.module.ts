import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';

class CreateRefundDto {
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsEnum(PaymentMethod) method!: PaymentMethod;
  @IsString() @MaxLength(1000) reason!: string;
  @IsOptional() @IsString() @MaxLength(300) reference?: string;
}

type RefundRow = {
  id: string;
  tenantId: string;
  paymentId: string;
  refundNumber: string;
  amount: Prisma.Decimal;
  method: PaymentMethod;
  status: 'POSTED' | 'CANCELLED';
  reason: string;
  reference: string | null;
  processedById: string;
  refundedAt: Date;
  createdAt: Date;
};

@Injectable()
class RefundsService {
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
    return this.prisma.$queryRaw<RefundRow[]>(Prisma.sql`
      SELECT id, tenant_id AS "tenantId", payment_id AS "paymentId", refund_number AS "refundNumber",
             amount, method, status, reason, reference, processed_by_id AS "processedById",
             refunded_at AS "refundedAt", created_at AS "createdAt"
      FROM "payment_refunds"
      WHERE tenant_id = ${i.tenantId}::uuid AND payment_id = ${paymentId}::uuid
      ORDER BY refunded_at DESC
    `);
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
      if (payment.status !== 'VERIFIED') throw new BadRequestException('Hanya payment VERIFIED yang dapat direfund');
      if (!payment.financialEntry || payment.financialEntry.origin !== 'PAYMENT' || payment.financialEntry.status !== 'POSTED' || payment.financialEntry.direction !== 'IN') {
        throw new BadRequestException('Canonical ledger payment tidak valid; jalankan reconciliation sebelum refund');
      }

      const refunded = await tx.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
        SELECT COALESCE(SUM(amount), 0)::numeric(18,2) AS total
        FROM "payment_refunds"
        WHERE tenant_id = ${i.tenantId}::uuid AND payment_id = ${payment.id}::uuid AND status = 'POSTED'
      `);
      const alreadyRefunded = Number(refunded[0]?.total ?? 0);
      const remaining = Number(payment.amount) - alreadyRefunded;
      if (d.amount > remaining) throw new BadRequestException(`Refund melebihi sisa refundable payment (${remaining})`);

      const refundId = randomUUID();
      const refundNumber = await this.nextRefundNumber(tx, i.tenantId);
      const refundedAt = new Date();
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "payment_refunds" ("id", "tenant_id", "payment_id", "refund_number", "amount", "method", "status", "reason", "reference", "processed_by_id", "refunded_at", "created_at")
        VALUES (${refundId}::uuid, ${i.tenantId}::uuid, ${payment.id}::uuid, ${refundNumber}, ${d.amount}, ${d.method}::"PaymentMethod", 'POSTED', ${reason}, ${d.reference ?? null}, ${i.userId}::uuid, ${refundedAt}, CURRENT_TIMESTAMP)
      `);
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO "financial_entries" ("id", "tenant_id", "recorded_by_id", "refund_id", "invoice_id", "booking_id", "origin", "status", "direction", "cost_type", "category", "description", "amount", "transaction_date", "reference", "fixed_cost", "notes", "created_at", "updated_at")
        VALUES (${randomUUID()}::uuid, ${i.tenantId}::uuid, ${i.userId}::uuid, ${refundId}::uuid, ${payment.invoiceId}::uuid, ${payment.invoice.bookingId}::uuid, 'REFUND', 'POSTED', 'OUT', 'REVENUE', 'CUSTOMER_REFUND', ${`Refund ${refundNumber} untuk pembayaran ${payment.paymentNumber} / invoice ${payment.invoice.invoiceNumber}`}, ${d.amount}, ${refundedAt}, ${d.reference || refundNumber}, false, ${reason}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      const verified = await tx.payment.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, invoiceId: payment.invoiceId, status: 'VERIFIED' } });
      const invoiceRefunds = await tx.$queryRaw<Array<{ total: Prisma.Decimal }>>(Prisma.sql`
        SELECT COALESCE(SUM(r.amount), 0)::numeric(18,2) AS total
        FROM "payment_refunds" r
        JOIN "payments" p ON p.id = r.payment_id
        WHERE r.tenant_id = ${i.tenantId}::uuid AND p.invoice_id = ${payment.invoiceId}::uuid AND r.status = 'POSTED'
      `);
      const netPaid = Math.max(0, Number(verified._sum.amount ?? 0) - Number(invoiceRefunds[0]?.total ?? 0));
      const invoiceTotal = Number(payment.invoice.totalAmount);
      const fullyRefunded = netPaid === 0 && Number(invoiceRefunds[0]?.total ?? 0) > 0;
      const invoiceStatus = fullyRefunded ? 'REFUNDED' : netPaid >= invoiceTotal ? 'PAID' : netPaid > 0 ? 'PARTIALLY_PAID' : 'ISSUED';
      await tx.invoice.update({ where: { id: payment.invoiceId }, data: { paidAmount: netPaid, status: invoiceStatus } });
      await tx.booking.update({ where: { id: payment.invoice.bookingId }, data: { paidAmount: netPaid, status: fullyRefunded ? 'REFUNDED' : netPaid >= invoiceTotal ? 'CONFIRMED' : netPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING_PAYMENT' } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'payment.refunded', resourceType: 'PaymentRefund', resourceId: refundId, requestId: i.requestId, metadata: { paymentId: payment.id, paymentNumber: payment.paymentNumber, invoiceId: payment.invoiceId, refundNumber, amount: d.amount, method: d.method, reason, netPaid } } });
      await tx.outboxEvent.create({ data: { tenantId: i.tenantId, eventType: 'payment.refunded', aggregateType: 'payment', aggregateId: payment.id, payload: { event_id: randomUUID(), event_type: 'payment.refunded', tenant_id: i.tenantId, actor_id: i.userId, aggregate_type: 'payment', aggregate_id: payment.id, schema_version: 1, refund_id: refundId, refund_number: refundNumber, amount: d.amount } } });

      return { id: refundId, refundNumber, paymentId: payment.id, amount: d.amount, method: d.method, status: 'POSTED', reason, reference: d.reference ?? null, refundedAt, remainingRefundable: remaining - d.amount, invoice: { id: payment.invoiceId, paidAmount: netPaid, status: invoiceStatus } };
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

@Module({ controllers: [RefundsController], providers: [RefundsService, PrismaService, IdentityGuard, PermissionGuard] })
export class RefundsModule {}
