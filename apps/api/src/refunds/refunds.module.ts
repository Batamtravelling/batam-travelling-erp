import { BadRequestException, Body, ConflictException, Controller, ForbiddenException, Get, Headers, Inject, Injectable, Module, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentMethod, Prisma, RefundStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { buildPaymentRefundLedgerEntry } from '../core/financial-ledger.js';
import { evaluateRefundLifecycle } from '../core/refund-policy.js';

export class CreateRefundRequestDto {
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) @Max(1_000_000_000_000) amount!: number;
  @IsOptional() @IsEnum(PaymentMethod) method?: PaymentMethod;
  @IsString() @MaxLength(1000) reason!: string;
  @IsOptional() @IsBoolean() isException?: boolean;
  @IsOptional() @IsString() @MaxLength(1000) exceptionReason?: string;
  @IsOptional() @IsString() @MaxLength(1000) methodChangeReason?: string;
}

export class ApprovalDto { @IsString() @MaxLength(1000) reason!: string; }
export class RejectRefundDto { @IsString() @MaxLength(1000) reason!: string; }
export class ExecuteRefundDto {
  @IsString() @MaxLength(300) reference!: string;
  @IsString() @MaxLength(2000) proofUrl!: string;
}

const activeRefundStatuses: RefundStatus[] = ['REQUESTED', 'MANAGER_APPROVED', 'OWNER_APPROVED', 'PROCESSING', 'EXECUTED'];

export type RefundExecutionResult = {
  id: string; refundNumber: string; paymentId: string; amount: number; method: PaymentMethod; status: 'EXECUTED';
  refundedAt: string; reference: string; proofUrl: string; remainingRefundable: number;
  invoice: { id: string; paidAmount: number; status: string };
};

@Injectable()
export class RefundsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private require(i: RequestIdentity, permission: string) {
    if (!i.permissions.has(permission)) throw new ForbiddenException('Permission denied');
  }

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
    this.require(i, 'refund.view');
    const payment = await this.prisma.payment.findFirst({ where: { id: paymentId, tenantId: i.tenantId }, select: { id: true } });
    if (!payment) throw new NotFoundException('Payment tidak ditemukan');
    return this.prisma.paymentRefund.findMany({ where: { tenantId: i.tenantId, paymentId }, orderBy: { requestedAt: 'desc' } });
  }

  async get(i: RequestIdentity, id: string) {
    this.require(i, 'refund.view');
    const refund = await this.prisma.paymentRefund.findFirst({ where: { id, tenantId: i.tenantId } });
    if (!refund) throw new NotFoundException('Refund request tidak ditemukan');
    return refund;
  }

  async request(i: RequestIdentity, paymentId: string, d: CreateRefundRequestDto) {
    this.require(i, 'refund.request');
    const reason = d.reason.trim();
    const exceptionReason = d.exceptionReason?.trim();
    const methodChangeReason = d.methodChangeReason?.trim();
    if (!reason) throw new BadRequestException('Alasan refund wajib diisi');
    if (d.isException && !exceptionReason) throw new BadRequestException('Alasan exception wajib diisi');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment-refund:${paymentId}`}))`;
      const payment = await tx.payment.findFirst({ where: { id: paymentId, tenantId: i.tenantId }, include: { financialEntry: true } });
      if (!payment) throw new NotFoundException('Payment tidak ditemukan');
      if (payment.status !== 'VERIFIED') throw new BadRequestException('Hanya payment VERIFIED yang dapat direfund');
      if (!payment.financialEntry || payment.financialEntry.origin !== 'PAYMENT' || payment.financialEntry.status !== 'POSTED' || payment.financialEntry.direction !== 'IN') throw new BadRequestException('Canonical ledger payment tidak valid; jalankan reconciliation sebelum refund');
      const method = d.method ?? payment.method;
      if (method !== payment.method && !methodChangeReason) throw new BadRequestException('Alasan perubahan metode refund wajib diisi');
      const policy = await tx.tenantRefundPolicy.findUnique({ where: { tenantId: i.tenantId } });
      if (!policy) throw new BadRequestException('Tenant refund policy belum dikonfigurasi');
      const committed = await tx.paymentRefund.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, paymentId, status: { in: activeRefundStatuses } } });
      const remaining = Number(payment.amount) - Number(committed._sum.amount ?? 0);
      if (d.amount > remaining) throw new BadRequestException(`Refund melebihi sisa refundable payment (${remaining})`);
      const requiresOwnerApproval = d.amount > Number(policy.managerApprovalLimit) || d.isException === true;
      const refundNumber = await this.nextRefundNumber(tx, i.tenantId);
      const refund = await tx.paymentRefund.create({ data: { tenantId: i.tenantId, paymentId, refundNumber, amount: d.amount, method, status: 'REQUESTED', reason, isException: d.isException ?? false, exceptionReason, methodChangeReason, requiresOwnerApproval, policyThresholdAmount: policy.managerApprovalLimit, requesterId: i.userId } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'refund.requested', resourceType: 'PaymentRefund', resourceId: refund.id, requestId: i.requestId, metadata: { paymentId, refundNumber, amount: d.amount, method, originalMethod: payment.method, methodChangeReason: methodChangeReason ?? null, isException: d.isException ?? false, exceptionReason: exceptionReason ?? null, requiresOwnerApproval, policyThresholdAmount: Number(policy.managerApprovalLimit) } } });
      return refund;
    });
  }

  async approveManager(i: RequestIdentity, id: string, d: ApprovalDto) {
    this.require(i, 'refund.approve.manager');
    const reason = d.reason.trim(); if (!reason) throw new BadRequestException('Alasan persetujuan wajib diisi');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`refund-request:${id}`}))`;
      const refund = await tx.paymentRefund.findFirst({ where: { id, tenantId: i.tenantId } });
      if (!refund) throw new NotFoundException('Refund request tidak ditemukan');
      if (refund.requesterId === i.userId) throw new ForbiddenException('Requester tidak boleh menyetujui refund sendiri');
      if (refund.status !== 'REQUESTED') throw new ConflictException('Refund tidak menunggu persetujuan Finance Manager');
      const updated = await tx.paymentRefund.update({ where: { id }, data: { status: 'MANAGER_APPROVED', managerApprovedById: i.userId, managerApprovedAt: new Date(), managerApprovalReason: reason } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'refund.manager_approved', resourceType: 'PaymentRefund', resourceId: id, requestId: i.requestId, metadata: { fromStatus: refund.status, toStatus: updated.status, reason, methodChangeApproved: Boolean(refund.methodChangeReason) } } });
      return updated;
    });
  }

  async approveOwner(i: RequestIdentity, id: string, d: ApprovalDto) {
    this.require(i, 'refund.approve.owner');
    const reason = d.reason.trim(); if (!reason) throw new BadRequestException('Alasan persetujuan wajib diisi');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`refund-request:${id}`}))`;
      const refund = await tx.paymentRefund.findFirst({ where: { id, tenantId: i.tenantId } });
      if (!refund) throw new NotFoundException('Refund request tidak ditemukan');
      if (refund.requesterId === i.userId) throw new ForbiddenException('Requester tidak boleh menyetujui refund sendiri');
      if (!refund.requiresOwnerApproval) throw new BadRequestException('Refund ini tidak memerlukan persetujuan Owner');
      if (refund.status !== 'MANAGER_APPROVED' || !refund.managerApprovedById) throw new ConflictException('Persetujuan Finance Manager wajib selesai lebih dahulu');
      if (refund.managerApprovedById === i.userId) throw new ForbiddenException('Persetujuan Owner harus diberikan oleh approver kedua');
      const updated = await tx.paymentRefund.update({ where: { id }, data: { status: 'OWNER_APPROVED', ownerApprovedById: i.userId, ownerApprovedAt: new Date(), ownerApprovalReason: reason } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'refund.owner_approved', resourceType: 'PaymentRefund', resourceId: id, requestId: i.requestId, metadata: { fromStatus: refund.status, toStatus: updated.status, reason } } });
      return updated;
    });
  }

  async reject(i: RequestIdentity, id: string, d: RejectRefundDto) {
    this.require(i, 'refund.reject');
    const reason = d.reason.trim(); if (!reason) throw new BadRequestException('Alasan penolakan wajib diisi');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`refund-request:${id}`}))`;
      const refund = await tx.paymentRefund.findFirst({ where: { id, tenantId: i.tenantId } });
      if (!refund) throw new NotFoundException('Refund request tidak ditemukan');
      if (!['REQUESTED', 'MANAGER_APPROVED', 'OWNER_APPROVED'].includes(refund.status)) throw new ConflictException('Refund tidak dapat ditolak dari status saat ini');
      const updated = await tx.paymentRefund.update({ where: { id }, data: { status: 'REJECTED', rejectedById: i.userId, rejectedAt: new Date(), rejectionReason: reason } });
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'refund.rejected', resourceType: 'PaymentRefund', resourceId: id, requestId: i.requestId, metadata: { fromStatus: refund.status, toStatus: updated.status, reason } } });
      return updated;
    });
  }

  async execute(i: RequestIdentity, id: string, d: ExecuteRefundDto, idempotencyKey: string | undefined): Promise<RefundExecutionResult> {
    this.require(i, 'refund.process');
    const key = idempotencyKey?.trim();
    if (!key || key.length < 8 || key.length > 200) throw new BadRequestException('Idempotency-Key wajib diisi (8-200 karakter)');
    const reference = d.reference.trim(), proofUrl = d.proofUrl.trim();
    if (!reference || !proofUrl) throw new BadRequestException('Referensi dan bukti refund wajib diisi');
    const operation = `refund.execute:${id}`;
    const requestHash = createHash('sha256').update(JSON.stringify({ id, reference, proofUrl })).digest('hex');
    return this.prisma.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`refund-request:${id}`}))`;
      const replay = await tx.idempotencyRecord.findUnique({ where: { tenantId_operation_key: { tenantId: i.tenantId, operation, key } } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw new ConflictException('Idempotency-Key digunakan dengan payload berbeda');
        if (!replay.response) throw new ConflictException('Eksekusi dengan Idempotency-Key ini masih diproses');
        return replay.response as unknown as RefundExecutionResult;
      }
      const refund = await tx.paymentRefund.findFirst({ where: { id, tenantId: i.tenantId }, include: { payment: { include: { invoice: true, financialEntry: true } } } });
      if (!refund) throw new NotFoundException('Refund request tidak ditemukan');
      if (refund.status === 'EXECUTED') throw new ConflictException('Refund sudah dieksekusi dengan Idempotency-Key berbeda');
      const expectedStatus: RefundStatus = refund.requiresOwnerApproval ? 'OWNER_APPROVED' : 'MANAGER_APPROVED';
      if (refund.status !== expectedStatus || !refund.managerApprovedById || (refund.requiresOwnerApproval && !refund.ownerApprovedById)) throw new ConflictException('Seluruh persetujuan refund wajib selesai sebelum eksekusi');
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment-refund:${refund.paymentId}`}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`invoice-refund:${refund.payment.invoiceId}`}))`;
      if (refund.payment.status !== 'VERIFIED' || !refund.payment.financialEntry || refund.payment.financialEntry.origin !== 'PAYMENT' || refund.payment.financialEntry.status !== 'POSTED') throw new BadRequestException('Canonical payment tidak valid untuk refund');
      await tx.paymentRefund.update({ where: { id }, data: { status: 'PROCESSING' } });
      const executedRefunds = await tx.paymentRefund.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, paymentId: refund.paymentId, status: 'EXECUTED' } });
      const verified = await tx.payment.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, invoiceId: refund.payment.invoiceId, status: 'VERIFIED' } });
      const invoiceRefundsBefore = await tx.paymentRefund.aggregate({ _sum: { amount: true }, where: { tenantId: i.tenantId, payment: { invoiceId: refund.payment.invoiceId }, status: 'EXECUTED' } });
      const alreadyRefunded = Number(executedRefunds._sum.amount ?? 0);
      const invoiceRefundsAfterRequest = Number(invoiceRefundsBefore._sum.amount ?? 0) + Number(refund.amount);
      let lifecycle;
      try { lifecycle = evaluateRefundLifecycle({ paymentAmount: Number(refund.payment.amount), alreadyRefunded, requestedAmount: Number(refund.amount), invoiceTotal: Number(refund.payment.invoice.totalAmount), verifiedInvoicePayments: Number(verified._sum.amount ?? 0), invoiceRefundsAfterRequest }); }
      catch (error) { if (error instanceof Error && error.message === 'REFUND_EXCEEDS_REMAINING') throw new BadRequestException('Refund melebihi sisa refundable payment'); throw error; }
      const refundedAt = new Date();
      await tx.financialEntry.create({ data: buildPaymentRefundLedgerEntry({ tenantId: i.tenantId, recordedById: i.userId, refundId: refund.id, refundNumber: refund.refundNumber, paymentId: refund.paymentId, paymentNumber: refund.payment.paymentNumber, invoiceId: refund.payment.invoiceId, invoiceNumber: refund.payment.invoice.invoiceNumber, bookingId: refund.payment.invoice.bookingId, amount: refund.amount, refundedAt, reference, reason: refund.reason }) });
      await tx.invoice.update({ where: { id: refund.payment.invoiceId }, data: { paidAmount: lifecycle.netPaid, status: lifecycle.invoiceStatus } });
      await tx.booking.update({ where: { id: refund.payment.invoice.bookingId }, data: { paidAmount: lifecycle.netPaid, status: lifecycle.bookingStatus } });
      const updated = await tx.paymentRefund.update({ where: { id }, data: { status: 'EXECUTED', processedById: i.userId, refundedAt, executionReference: reference, proofUrl, executionIdempotencyKey: key } });
      const response: RefundExecutionResult = { id: updated.id, refundNumber: updated.refundNumber, paymentId: updated.paymentId, amount: Number(updated.amount), method: updated.method, status: 'EXECUTED', refundedAt: refundedAt.toISOString(), reference, proofUrl, remainingRefundable: lifecycle.remainingAfter, invoice: { id: refund.payment.invoiceId, paidAmount: lifecycle.netPaid, status: lifecycle.invoiceStatus } };
      await tx.auditLog.create({ data: { tenantId: i.tenantId, actorId: i.userId, action: 'refund.executed', resourceType: 'PaymentRefund', resourceId: id, requestId: i.requestId, metadata: { paymentId: refund.paymentId, refundNumber: refund.refundNumber, amount: Number(refund.amount), method: refund.method, requesterId: refund.requesterId, managerApprovedById: refund.managerApprovedById, ownerApprovedById: refund.ownerApprovedById, executorId: i.userId, reference, proofUrl, idempotencyKey: key, netPaid: lifecycle.netPaid } } });
      await tx.outboxEvent.create({ data: { tenantId: i.tenantId, eventType: 'refund.executed', aggregateType: 'refund', aggregateId: id, payload: { event_id: randomUUID(), event_type: 'refund.executed', tenant_id: i.tenantId, actor_id: i.userId, aggregate_type: 'refund', aggregate_id: id, schema_version: 1, payment_id: refund.paymentId, refund_number: refund.refundNumber, amount: Number(refund.amount) } } });
      await tx.idempotencyRecord.create({ data: { tenantId: i.tenantId, operation, key, requestHash, response, statusCode: 200, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
      return response;
    });
  }
}

@UseGuards(IdentityGuard, PermissionGuard)
@Controller()
export class RefundsController {
  constructor(@Inject(RefundsService) private readonly refunds: RefundsService) {}
  @Get('payments/:paymentId/refunds') @Permissions('refund.view') list(@CurrentIdentity() i: RequestIdentity, @Param('paymentId') paymentId: string) { return this.refunds.listForPayment(i, paymentId); }
  @Post('payments/:paymentId/refund-requests') @Permissions('refund.request') request(@CurrentIdentity() i: RequestIdentity, @Param('paymentId') paymentId: string, @Body() d: CreateRefundRequestDto) { return this.refunds.request(i, paymentId, d); }
  @Get('refund-requests/:id') @Permissions('refund.view') get(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string) { return this.refunds.get(i, id); }
  @Post('refund-requests/:id/manager-approval') @Permissions('refund.approve.manager') approveManager(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string, @Body() d: ApprovalDto) { return this.refunds.approveManager(i, id, d); }
  @Post('refund-requests/:id/owner-approval') @Permissions('refund.approve.owner') approveOwner(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string, @Body() d: ApprovalDto) { return this.refunds.approveOwner(i, id, d); }
  @Post('refund-requests/:id/reject') @Permissions('refund.reject') reject(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string, @Body() d: RejectRefundDto) { return this.refunds.reject(i, id, d); }
  @Post('refund-requests/:id/execute') @Permissions('refund.process') execute(@CurrentIdentity() i: RequestIdentity, @Param('id') id: string, @Body() d: ExecuteRefundDto, @Headers('idempotency-key') key?: string) { return this.refunds.execute(i, id, d, key); }
}

@Module({ controllers: [RefundsController], providers: [RefundsService, PrismaService, IdentityGuard, PermissionGuard], exports: [RefundsService] })
export class RefundsModule {}
