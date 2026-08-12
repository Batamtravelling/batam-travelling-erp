import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookingCodeService } from '../core/booking-code.service.js';
import { PrismaService } from '../core/prisma.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { AcceptQuotationDto, ConvertQuotationDto, CreateQuotationDto, QuotationItemDto, QuotationQueryDto, RejectQuotationDto, UpdateQuotationDto } from './dto.js';

type ResolvedItem = {
  serviceProductId?: string;
  name: string;
  description?: string;
  quantity: Prisma.Decimal;
  unit: string;
  unitPrice: Prisma.Decimal;
  totalPrice: Prisma.Decimal;
  sortOrder: number;
};

const quotationInclude = {
  customer: { select: { id: true, customerCode: true, fullName: true, phone: true, email: true } },
  lead: { select: { id: true, leadCode: true, status: true } },
  package: { select: { id: true, packageCode: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  sentBy: { select: { id: true, name: true } },
  acceptedBy: { select: { id: true, name: true } },
  items: { orderBy: { sortOrder: 'asc' as const } },
  versions: { select: { id: true, version: true, createdAt: true, createdBy: { select: { id: true, name: true } } }, orderBy: { version: 'desc' as const } },
  booking: { select: { id: true, bookingCode: true, status: true } },
};

function dateOnly(value: string, field: string): Date {
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${field} tidak valid`);
  return date;
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function decimalNumber(value: Prisma.Decimal | number | string): number {
  return Number(value);
}

export function quotationItemsRequireRepricing(input: {
  itemsProvided: boolean;
  packageChanged: boolean;
  paxChanged: boolean;
  hasPackage: boolean;
}) {
  return input.itemsProvided || input.packageChanged || (input.paxChanged && input.hasPackage);
}

function snapshotOf(quotation: Record<string, any>, items: ResolvedItem[]) {
  return {
    quotationNumber: quotation.quotationNumber,
    version: quotation.version,
    customerId: quotation.customerId,
    leadId: quotation.leadId ?? null,
    packageId: quotation.packageId ?? null,
    status: quotation.status,
    travelDate: new Date(quotation.travelDate).toISOString().slice(0, 10),
    returnDate: quotation.returnDate ? new Date(quotation.returnDate).toISOString().slice(0, 10) : null,
    pax: quotation.pax,
    destination: quotation.destination ?? null,
    packageName: quotation.packageName ?? null,
    subtotalAmount: decimalNumber(quotation.subtotalAmount),
    totalAmount: decimalNumber(quotation.totalAmount),
    currency: quotation.currency,
    validUntil: new Date(quotation.validUntil).toISOString().slice(0, 10),
    terms: quotation.terms ?? null,
    notes: quotation.notes ?? null,
    items: items.map((item) => ({
      serviceProductId: item.serviceProductId ?? null,
      name: item.name,
      description: item.description ?? null,
      quantity: decimalNumber(item.quantity),
      unit: item.unit,
      unitPrice: decimalNumber(item.unitPrice),
      totalPrice: decimalNumber(item.totalPrice),
      sortOrder: item.sortOrder,
    })),
  };
}

@Injectable()
export class SalesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BookingCodeService) private readonly codes: BookingCodeService,
  ) {}

  private db(client: PrismaService | Prisma.TransactionClient = this.prisma): any {
    return client as any;
  }

  async list(identity: RequestIdentity, query: QuotationQueryDto = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 12)));
    const search = String(query.search || '').trim();
    const where = {
      tenantId: identity.tenantId,
      ...(query.status ? { status: query.status } : {}),
      ...(search ? {
        OR: [
          { quotationNumber: { contains: search, mode: 'insensitive' as const } },
          { destination: { contains: search, mode: 'insensitive' as const } },
          { packageName: { contains: search, mode: 'insensitive' as const } },
          { customer: { fullName: { contains: search, mode: 'insensitive' as const } } },
        ],
      } : {}),
    };
    const [total, items] = await Promise.all([
      this.db().quotation.count({ where }),
      this.db().quotation.findMany({
        where,
        include: quotationInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async find(identity: RequestIdentity, id: string) {
    const quotation = await this.db().quotation.findFirst({ where: { id, tenantId: identity.tenantId }, include: quotationInclude });
    if (!quotation) throw new NotFoundException('Quotation tidak ditemukan');
    return quotation;
  }

  private async validateReferences(identity: RequestIdentity, dto: Pick<CreateQuotationDto, 'customerId' | 'leadId' | 'packageId'>) {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId: identity.tenantId, archivedAt: null, status: 'ACTIVE' }, select: { id: true } });
    if (!customer) throw new BadRequestException('Customer tidak valid atau tidak aktif');

    const lead = dto.leadId ? await this.prisma.lead.findFirst({ where: { id: dto.leadId, tenantId: identity.tenantId }, select: { id: true, customerId: true, status: true } }) : null;
    if (dto.leadId && !lead) throw new BadRequestException('Lead tidak valid');
    if (lead?.customerId && lead.customerId !== dto.customerId) throw new BadRequestException('Lead bukan milik customer yang dipilih');

    const travelPackage = dto.packageId ? await this.prisma.travelPackage.findFirst({
      where: { id: dto.packageId, tenantId: identity.tenantId, archivedAt: null, status: 'ACTIVE', approvalStatus: 'APPROVED' },
      include: { prices: { where: { active: true }, orderBy: { priority: 'desc' }, take: 1 } },
    }) : null;
    if (dto.packageId && !travelPackage) throw new BadRequestException('Paket belum aktif atau belum disetujui');
    return { lead, travelPackage };
  }

  private validateDates(travelDateValue: string, returnDateValue: string | undefined, validUntilValue: string) {
    const travelDate = dateOnly(travelDateValue, 'Tanggal perjalanan');
    const returnDate = returnDateValue ? dateOnly(returnDateValue, 'Tanggal kembali') : undefined;
    const validUntil = dateOnly(validUntilValue, 'Masa berlaku');
    if (returnDate && returnDate < travelDate) throw new BadRequestException('Tanggal kembali tidak boleh sebelum tanggal perjalanan');
    if (validUntil < todayUtc()) throw new BadRequestException('Masa berlaku quotation sudah berakhir');
    return { travelDate, returnDate, validUntil };
  }

  private async resolveItems(identity: RequestIdentity, input: QuotationItemDto[] | undefined, travelPackage: any, pax: number): Promise<ResolvedItem[]> {
    const items: ResolvedItem[] = [];
    if (travelPackage) {
      const price = new Prisma.Decimal(travelPackage.adultPrice ?? travelPackage.prices[0]?.sellingPrice ?? 0);
      if (price.lte(0)) throw new BadRequestException('Harga paket belum dikonfigurasi');
      const quantity = new Prisma.Decimal(pax);
      items.push({
        name: travelPackage.name,
        description: travelPackage.description ?? undefined,
        quantity,
        unit: 'pax',
        unitPrice: price,
        totalPrice: price.mul(quantity),
        sortOrder: 0,
      });
    }

    for (const [index, line] of (input ?? []).entries()) {
      const quantity = new Prisma.Decimal(line.quantity);
      if (line.serviceProductId) {
        const product = await this.prisma.serviceProduct.findFirst({ where: { id: line.serviceProductId, tenantId: identity.tenantId, active: true } });
        if (!product) throw new BadRequestException(`Layanan tambahan baris ${index + 1} tidak valid`);
        const price = new Prisma.Decimal(product.price);
        items.push({ serviceProductId: product.id, name: product.name, description: product.description ?? undefined, quantity, unit: product.unit, unitPrice: price, totalPrice: price.mul(quantity), sortOrder: items.length });
        continue;
      }
      if (!line.name?.trim() || !line.unit?.trim() || line.unitPrice === undefined) throw new BadRequestException(`Item custom baris ${index + 1} memerlukan nama, unit, dan harga`);
      const price = new Prisma.Decimal(line.unitPrice);
      items.push({ name: line.name.trim(), description: line.description?.trim(), quantity, unit: line.unit.trim(), unitPrice: price, totalPrice: price.mul(quantity), sortOrder: items.length });
    }
    if (!items.length) throw new BadRequestException('Quotation memerlukan paket atau minimal satu item');
    return items;
  }

  async create(identity: RequestIdentity, dto: CreateQuotationDto) {
    const { lead, travelPackage } = await this.validateReferences(identity, dto);
    const dates = this.validateDates(dto.travelDate, dto.returnDate, dto.validUntil);
    const items = await this.resolveItems(identity, dto.items, travelPackage, dto.pax);
    const subtotal = items.reduce((sum, item) => sum.add(item.totalPrice), new Prisma.Decimal(0));

    return this.prisma.$transaction(async (rawTx) => {
      const tx = this.db(rawTx);
      const quotationNumber = await this.codes.nextQuotation(rawTx, identity.tenantId);
      const quotation = await tx.quotation.create({ data: {
        tenantId: identity.tenantId,
        quotationNumber,
        customerId: dto.customerId,
        leadId: dto.leadId,
        packageId: dto.packageId,
        createdById: identity.userId,
        travelDate: dates.travelDate,
        returnDate: dates.returnDate,
        pax: dto.pax,
        destination: dto.destination?.trim() || travelPackage?.destination,
        packageName: travelPackage?.name,
        subtotalAmount: subtotal,
        totalAmount: subtotal,
        validUntil: dates.validUntil,
        terms: dto.terms?.trim(),
        notes: dto.notes?.trim(),
      } });
      await tx.quotationItem.createMany({ data: items.map((item) => ({ ...item, tenantId: identity.tenantId, quotationId: quotation.id })) });
      await tx.quotationVersion.create({ data: { tenantId: identity.tenantId, quotationId: quotation.id, version: 1, createdById: identity.userId, snapshot: snapshotOf(quotation, items) } });
      await tx.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action: 'quotation.created', resourceType: 'Quotation', resourceId: quotation.id, requestId: identity.requestId, metadata: { quotationNumber, customerId: dto.customerId, leadId: dto.leadId ?? null, packageId: dto.packageId ?? null, totalAmount: subtotal.toNumber() } } });
      await tx.outboxEvent.create({ data: { tenantId: identity.tenantId, eventType: 'quotation.created', aggregateType: 'quotation', aggregateId: quotation.id, payload: { event_id: crypto.randomUUID(), event_type: 'quotation.created', tenant_id: identity.tenantId, actor_id: identity.userId, aggregate_type: 'quotation', aggregate_id: quotation.id, schema_version: 1 } } });
      if (lead && ['QUALIFIED', 'QUOTATION', 'NEGOTIATION'].includes(lead.status)) await rawTx.lead.update({ where: { id: lead.id }, data: { status: 'QUOTATION' } });
      return tx.quotation.findUniqueOrThrow({ where: { id: quotation.id }, include: quotationInclude });
    });
  }

  async update(identity: RequestIdentity, id: string, dto: UpdateQuotationDto) {
    const current = await this.find(identity, id);
    if (!['DRAFT', 'READY', 'NEGOTIATION'].includes(current.status)) throw new ConflictException('Quotation pada status ini tidak dapat diedit');
    const merged = {
      customerId: dto.customerId ?? current.customerId,
      leadId: dto.leadId ?? current.leadId ?? undefined,
      packageId: dto.packageId ?? current.packageId ?? undefined,
    };
    const { travelPackage } = await this.validateReferences(identity, merged);
    const dates = this.validateDates(
      dto.travelDate ?? new Date(current.travelDate).toISOString(),
      dto.returnDate ?? (current.returnDate ? new Date(current.returnDate).toISOString() : undefined),
      dto.validUntil ?? new Date(current.validUntil).toISOString(),
    );
    const packageChanged = dto.packageId !== undefined && dto.packageId !== current.packageId;
    const paxChanged = dto.pax !== undefined && dto.pax !== current.pax;
    const repriceItems = quotationItemsRequireRepricing({
      itemsProvided: dto.items !== undefined,
      packageChanged,
      paxChanged,
      hasPackage: Boolean(merged.packageId),
    });
    const items: ResolvedItem[] = repriceItems
      ? await this.resolveItems(identity, dto.items, travelPackage, dto.pax ?? current.pax)
      : current.items.map((item: any, index: number) => ({ serviceProductId: item.serviceProductId ?? undefined, name: item.name, description: item.description ?? undefined, quantity: new Prisma.Decimal(item.quantity), unit: item.unit, unitPrice: new Prisma.Decimal(item.unitPrice), totalPrice: new Prisma.Decimal(item.totalPrice), sortOrder: index }));
    const subtotal = items.reduce((sum, item) => sum.add(item.totalPrice), new Prisma.Decimal(0));
    const version = current.version + 1;

    return this.prisma.$transaction(async (rawTx) => {
      const tx = this.db(rawTx);
      const claimed = await tx.quotation.updateMany({ where: { id, tenantId: identity.tenantId, version: current.version }, data: {
        customerId: merged.customerId,
        leadId: merged.leadId,
        packageId: merged.packageId,
        version,
        travelDate: dates.travelDate,
        returnDate: dates.returnDate,
        pax: dto.pax ?? current.pax,
        destination: dto.destination?.trim() ?? current.destination,
        packageName: travelPackage?.name ?? current.packageName,
        subtotalAmount: subtotal,
        totalAmount: subtotal,
        validUntil: dates.validUntil,
        terms: dto.terms?.trim() ?? current.terms,
        notes: dto.notes?.trim() ?? current.notes,
      } });
      if (claimed.count !== 1) throw new ConflictException('Quotation telah diubah oleh pengguna lain; muat ulang sebelum menyimpan');
      const quotation = await tx.quotation.findUniqueOrThrow({ where: { id } });
      await tx.quotationItem.deleteMany({ where: { quotationId: id, tenantId: identity.tenantId } });
      await tx.quotationItem.createMany({ data: items.map((item) => ({ ...item, tenantId: identity.tenantId, quotationId: id })) });
      await tx.quotationVersion.create({ data: { tenantId: identity.tenantId, quotationId: id, version, createdById: identity.userId, snapshot: snapshotOf(quotation, items) } });
      await tx.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action: 'quotation.updated', resourceType: 'Quotation', resourceId: id, requestId: identity.requestId, metadata: { fromVersion: current.version, toVersion: version, totalAmount: subtotal.toNumber() } } });
      return tx.quotation.findUniqueOrThrow({ where: { id }, include: quotationInclude });
    });
  }

  async send(identity: RequestIdentity, id: string) {
    const current = await this.find(identity, id);
    if (!['DRAFT', 'READY', 'NEGOTIATION'].includes(current.status)) throw new ConflictException('Quotation tidak dapat dikirim dari status saat ini');
    if (new Date(current.validUntil) < todayUtc()) throw new ConflictException('Quotation sudah kedaluwarsa; terbitkan versi baru');
    if (!current.items.length || Number(current.totalAmount) <= 0) throw new ConflictException('Quotation belum memiliki item dan total yang valid');
    return this.transition(identity, current, 'SENT', { sentAt: new Date(), sentById: identity.userId }, 'quotation.sent');
  }

  async accept(identity: RequestIdentity, id: string, dto: AcceptQuotationDto) {
    const current = await this.find(identity, id);
    if (!['SENT', 'VIEWED', 'NEGOTIATION'].includes(current.status)) throw new ConflictException('Quotation tidak dapat diterima dari status saat ini');
    if (new Date(current.validUntil) < todayUtc()) {
      await this.db().quotation.update({ where: { id }, data: { status: 'EXPIRED' } });
      throw new ConflictException('Quotation sudah kedaluwarsa');
    }
    return this.transition(identity, current, 'ACCEPTED', { acceptedAt: new Date(), acceptedById: identity.userId, acceptanceMethod: dto.method }, 'quotation.accepted');
  }

  async reject(identity: RequestIdentity, id: string, dto: RejectQuotationDto) {
    const current = await this.find(identity, id);
    if (!['SENT', 'VIEWED', 'NEGOTIATION'].includes(current.status)) throw new ConflictException('Quotation tidak dapat ditolak dari status saat ini');
    return this.transition(identity, current, 'REJECTED', { rejectedAt: new Date(), rejectionReason: dto.reason.trim() }, 'quotation.rejected', { reason: dto.reason.trim() });
  }

  async duplicate(identity: RequestIdentity, id: string) {
    const current = await this.find(identity, id);
    const validUntil = new Date(current.validUntil) < todayUtc() ? todayUtc() : new Date(current.validUntil);
    const items: ResolvedItem[] = current.items.map((item: any, index: number) => ({ serviceProductId: item.serviceProductId ?? undefined, name: item.name, description: item.description ?? undefined, quantity: new Prisma.Decimal(item.quantity), unit: item.unit, unitPrice: new Prisma.Decimal(item.unitPrice), totalPrice: new Prisma.Decimal(item.totalPrice), sortOrder: index }));
    return this.prisma.$transaction(async (rawTx) => {
      const tx = this.db(rawTx);
      const quotationNumber = await this.codes.nextQuotation(rawTx, identity.tenantId);
      const copy = await tx.quotation.create({ data: { tenantId: identity.tenantId, quotationNumber, customerId: current.customerId, leadId: current.leadId, packageId: current.packageId, createdById: identity.userId, status: 'DRAFT', version: 1, travelDate: current.travelDate, returnDate: current.returnDate, pax: current.pax, destination: current.destination, packageName: current.packageName, subtotalAmount: current.subtotalAmount, totalAmount: current.totalAmount, currency: current.currency, validUntil, terms: current.terms, notes: current.notes } });
      await tx.quotationItem.createMany({ data: items.map((item) => ({ ...item, tenantId: identity.tenantId, quotationId: copy.id })) });
      await tx.quotationVersion.create({ data: { tenantId: identity.tenantId, quotationId: copy.id, version: 1, createdById: identity.userId, snapshot: snapshotOf(copy, items) } });
      await tx.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action: 'quotation.duplicated', resourceType: 'Quotation', resourceId: copy.id, requestId: identity.requestId, metadata: { sourceQuotationId: id, quotationNumber } } });
      return tx.quotation.findUniqueOrThrow({ where: { id: copy.id }, include: quotationInclude });
    });
  }

  async convert(identity: RequestIdentity, id: string, dto: ConvertQuotationDto) {
    const current = await this.find(identity, id);
    if (current.booking) return current.booking;
    if (current.status !== 'ACCEPTED') throw new ConflictException('Hanya quotation ACCEPTED yang dapat dikonversi menjadi booking');

    return this.prisma.$transaction(async (rawTx) => {
      const tx = this.db(rawTx);
      const claimed = await tx.quotation.updateMany({
        where: { id, tenantId: identity.tenantId, status: 'ACCEPTED', version: current.version, booking: null },
        data: { status: 'CONVERTED', convertedAt: new Date() },
      });
      if (claimed.count !== 1) throw new ConflictException('Quotation telah dikonversi atau berubah; muat ulang data');

      const bookingCode = await this.codes.next(rawTx, identity.tenantId, new Date(current.travelDate));
      const booking = await tx.booking.create({ data: {
        tenantId: identity.tenantId,
        bookingCode,
        customerId: current.customerId,
        packageId: current.packageId,
        quotationId: current.id,
        source: 'QUOTATION',
        status: 'PENDING_PAYMENT',
        packageName: current.packageName ?? current.destination ?? current.quotationNumber,
        travelDate: current.travelDate,
        returnDate: current.returnDate,
        pax: current.pax,
        totalAmount: current.totalAmount,
        notes: current.notes,
      } });
      await tx.bookingItem.createMany({ data: current.items.map((item: any) => ({
        tenantId: identity.tenantId,
        bookingId: booking.id,
        serviceProductId: item.serviceProductId,
        name: item.name,
        category: 'QUOTATION',
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        serviceDate: current.travelDate,
        notes: item.description,
      })) });
      const invoiceNumber = await this.codes.nextInvoice(rawTx, identity.tenantId);
      const invoice = await tx.invoice.create({ data: {
        tenantId: identity.tenantId,
        invoiceNumber,
        bookingId: booking.id,
        customerId: current.customerId,
        totalAmount: current.totalAmount,
        dueDate: dto.dueDate ? dateOnly(dto.dueDate, 'Jatuh tempo invoice') : undefined,
      } });
      await tx.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action: 'quotation.converted', resourceType: 'Quotation', resourceId: id, requestId: identity.requestId, metadata: { bookingId: booking.id, bookingCode, invoiceId: invoice.id, invoiceNumber } } });
      await tx.outboxEvent.create({ data: { tenantId: identity.tenantId, eventType: 'quotation.converted', aggregateType: 'quotation', aggregateId: id, payload: { event_id: crypto.randomUUID(), event_type: 'quotation.converted', tenant_id: identity.tenantId, actor_id: identity.userId, aggregate_type: 'quotation', aggregate_id: id, booking_id: booking.id, schema_version: 1 } } });
      return tx.booking.findUniqueOrThrow({ where: { id: booking.id }, include: { customer: true, invoice: true, items: true, quotation: { select: { quotationNumber: true, version: true } } } });
    });
  }

  private async transition(identity: RequestIdentity, current: any, status: string, data: Record<string, unknown>, action: string, metadata?: Record<string, unknown>) {
    return this.prisma.$transaction(async (rawTx) => {
      const tx = this.db(rawTx);
      const claimed = await tx.quotation.updateMany({ where: { id: current.id, tenantId: identity.tenantId, status: current.status, version: current.version }, data: { status, ...data } });
      if (claimed.count !== 1) throw new ConflictException('Status quotation telah berubah; muat ulang sebelum melanjutkan');
      await tx.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action, resourceType: 'Quotation', resourceId: current.id, requestId: identity.requestId, metadata: { fromStatus: current.status, toStatus: status, ...(metadata ?? {}) } } });
      await tx.outboxEvent.create({ data: { tenantId: identity.tenantId, eventType: action, aggregateType: 'quotation', aggregateId: current.id, payload: { event_id: crypto.randomUUID(), event_type: action, tenant_id: identity.tenantId, actor_id: identity.userId, aggregate_type: 'quotation', aggregate_id: current.id, schema_version: 1 } } });
      return tx.quotation.findUniqueOrThrow({ where: { id: current.id }, include: quotationInclude });
    });
  }
}
