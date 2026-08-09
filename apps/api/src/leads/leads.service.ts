import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { AuditService } from '../core/audit.service.js';
import { PrismaService } from '../core/prisma.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { CreateLeadDto, TransitionLeadDto, UpdateLeadDto } from './dto.js';

export const transitions: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ['CONTACTED', 'LOST'], CONTACTED: ['QUALIFIED', 'LOST'], QUALIFIED: ['QUOTATION', 'LOST'],
  QUOTATION: ['NEGOTIATION', 'WON', 'LOST'], NEGOTIATION: ['WON', 'LOST'], WON: [], LOST: [],
};

export function canTransitionLead(from: LeadStatus, to: LeadStatus): boolean {
  return transitions[from].includes(to);
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async create(identity: RequestIdentity, dto: CreateLeadDto) {
    const customer = await this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId: identity.tenantId, archivedAt: null } });
    if (!customer) throw new NotFoundException('Customer not found');
    const count = await this.prisma.lead.count({ where: { tenantId: identity.tenantId } });
    const lead = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({ data: { tenantId: identity.tenantId, leadCode: `LEAD-${String(count + 1).padStart(6, '0')}`, customerId: dto.customerId, source: dto.source, requirement: dto.requirement, destination: dto.destination, travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined, returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined, pax: dto.pax, estimatedValue: dto.estimatedValue, assignedUserId: dto.assignedUserId, priority: dto.priority, notes: dto.notes } });
      await tx.outboxEvent.create({ data: { tenantId: identity.tenantId, eventType: 'lead.created', aggregateType: 'lead', aggregateId: created.id, payload: { event_id: crypto.randomUUID(), event_type: 'lead.created', tenant_id: identity.tenantId, actor_id: identity.userId, aggregate_type: 'lead', aggregate_id: created.id, schema_version: 1 } } });
      return created;
    });
    await this.audit.record(identity, 'lead.created', 'lead', lead.id);
    return lead;
  }
  list(identity: RequestIdentity) { return this.prisma.lead.findMany({ where: { tenantId: identity.tenantId }, include: { customer: true }, orderBy: { createdAt: 'desc' } }); }
  async find(identity: RequestIdentity, id: string) { const lead = await this.prisma.lead.findFirst({ where: { id, tenantId: identity.tenantId }, include: { customer: true } }); if (!lead) throw new NotFoundException('Lead not found'); return lead; }
  async update(identity: RequestIdentity, id: string, dto: UpdateLeadDto) { await this.find(identity, id); if (dto.customerId) await this.prisma.customer.findFirstOrThrow({ where: { id: dto.customerId, tenantId: identity.tenantId, archivedAt: null } }); const lead = await this.prisma.lead.update({ where: { id }, data: { ...dto, travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined, returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined } }); await this.audit.record(identity, 'lead.updated', 'lead', id); return lead; }
  async transition(identity: RequestIdentity, id: string, dto: TransitionLeadDto) {
    const lead = await this.find(identity, id);
    if (!canTransitionLead(lead.status, dto.status)) throw new BadRequestException(`Transition ${lead.status} -> ${dto.status} is not allowed`);
    if (dto.status === 'QUALIFIED' && (!lead.requirement || !lead.travelDate || !lead.pax)) throw new BadRequestException('Requirement, travel date, and pax are required before qualifying a lead');
    const data: { status: LeadStatus; firstContactAt?: Date } = { status: dto.status };
    if (dto.status === 'CONTACTED') data.firstContactAt = lead.firstContactAt ?? new Date();
    const updated = await this.prisma.lead.update({ where: { id }, data });
    await this.audit.record(identity, `lead.${dto.status.toLowerCase()}`, 'lead', id, dto.reason ? { reason: dto.reason } : undefined);
    return updated;
  }
}
