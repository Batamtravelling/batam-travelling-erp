import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { AuditService } from '../core/audit.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto.js';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async create(identity: RequestIdentity, dto: CreateCustomerDto) {
    const duplicate = await this.prisma.customer.findFirst({ where: { tenantId: identity.tenantId, archivedAt: null, OR: [dto.email ? { email: dto.email } : undefined, dto.phone ? { phone: dto.phone } : undefined].filter(Boolean) as any } });
    if (duplicate) throw new ConflictException('Possible duplicate customer found by email or phone');
    const count = await this.prisma.customer.count({ where: { tenantId: identity.tenantId } });
    const customer = await this.prisma.customer.create({ data: { tenantId: identity.tenantId, customerCode: `CUS-${String(count + 1).padStart(6, '0')}`, fullName: dto.fullName, type: dto.type, phone: dto.phone, email: dto.email, address: dto.address, city: dto.city, country: dto.country, leadSource: dto.leadSource, notes: dto.notes } });
    await this.audit.record(identity, 'customer.created', 'customer', customer.id);
    return customer;
  }
  list(identity: RequestIdentity) { return this.prisma.customer.findMany({ where: { tenantId: identity.tenantId, archivedAt: null }, orderBy: { createdAt: 'desc' } }); }
  async find(identity: RequestIdentity, id: string) { const customer = await this.prisma.customer.findFirst({ where: { id, tenantId: identity.tenantId, archivedAt: null } }); if (!customer) throw new NotFoundException('Customer not found'); return customer; }
  async update(identity: RequestIdentity, id: string, dto: UpdateCustomerDto) { await this.find(identity, id); const customer = await this.prisma.customer.update({ where: { id }, data: dto }); await this.audit.record(identity, 'customer.updated', 'customer', id); return customer; }
  async remove(identity: RequestIdentity, id: string) { const customer = await this.find(identity, id); await this.prisma.customer.update({ where: { id }, data: { archivedAt: new Date() } }); await this.audit.record(identity, 'customer.deleted', 'customer', id); return { id: customer.id, deleted: true }; }
}

