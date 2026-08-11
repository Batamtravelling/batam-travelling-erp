import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { AuditService } from '../core/audit.service.js';
import { BookingCodeService } from '../core/booking-code.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto.js';

@Injectable()
export class CustomersService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditService) private readonly audit: AuditService, @Inject(BookingCodeService) private readonly codes: BookingCodeService) {}
  async create(identity: RequestIdentity, dto: CreateCustomerDto) {
    const duplicate = await this.prisma.customer.findFirst({ where: { tenantId: identity.tenantId, archivedAt: null, OR: [dto.email ? { email: dto.email } : undefined, dto.phone ? { phone: dto.phone } : undefined].filter(Boolean) as any } });
    if (duplicate) throw new ConflictException('Possible duplicate customer found by email or phone');
    const customer = await this.prisma.$transaction(async tx => { const customerCode = await this.codes.nextCustomer(tx, identity.tenantId); return tx.customer.create({ data: { tenantId: identity.tenantId, customerCode, fullName: dto.fullName, type: dto.type, phone: dto.phone, email: dto.email, address: dto.address, city: dto.city, country: dto.country, leadSource: dto.leadSource, notes: dto.notes } }); });
    await this.audit.record(identity, 'customer.created', 'customer', customer.id);
    return customer;
  }
  async list(identity: RequestIdentity, query: { page?: number; pageSize?: number; search?: string } = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 12)));
    const search = String(query.search || '').trim();
    const where = {
      tenantId: identity.tenantId,
      archivedAt: null,
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { customerCode: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        include: { leads: { select: { id: true, leadCode: true, status: true, estimatedValue: true } }, bookings: { select: { id: true, totalAmount: true, status: true } }, followUps: { orderBy: { dueAt: 'desc' }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }
  async find(identity: RequestIdentity, id: string) { const customer = await this.prisma.customer.findFirst({ where: { id, tenantId: identity.tenantId, archivedAt: null } }); if (!customer) throw new NotFoundException('Customer not found'); return customer; }
  async update(identity: RequestIdentity, id: string, dto: UpdateCustomerDto) { await this.find(identity, id); const customer = await this.prisma.customer.update({ where: { id }, data: dto }); await this.audit.record(identity, 'customer.updated', 'customer', id); return customer; }
  async remove(identity: RequestIdentity, id: string) { const customer = await this.find(identity, id); await this.prisma.customer.update({ where: { id }, data: { archivedAt: new Date() } }); await this.audit.record(identity, 'customer.deleted', 'customer', id); return { id: customer.id, deleted: true }; }
}

