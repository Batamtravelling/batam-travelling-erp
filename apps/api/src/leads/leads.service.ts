import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@prisma/client';
import { AuditService } from '../core/audit.service.js';
import { PrismaService } from '../core/prisma.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { CreateFollowUpDto, CreateLeadDto, TransitionLeadDto, UpdateFollowUpDto, UpdateLeadDto, VerifyLeadDto } from './dto.js';

export const transitions: Record<LeadStatus, readonly LeadStatus[]> = {
  NEW: ['CONTACTED', 'LOST'], CONTACTED: ['QUALIFIED', 'LOST'], QUALIFIED: ['QUOTATION', 'LOST'],
  QUOTATION: ['NEGOTIATION', 'WON', 'LOST'], NEGOTIATION: ['WON', 'LOST'], WON: [], LOST: [],
};

export function canTransitionLead(from: LeadStatus, to: LeadStatus): boolean {
  return transitions[from].includes(to);
}

export function validateLeadTransition(from: LeadStatus, to: LeadStatus, reason?: string): void {
  if (!canTransitionLead(from, to)) {
    throw new BadRequestException(`Transition ${from} -> ${to} is not allowed`);
  }

  if (to === 'LOST' && !reason?.trim()) {
    throw new BadRequestException('A reason is required when marking a lead as lost');
  }
}

@Injectable()
export class LeadsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditService) private readonly audit: AuditService) {}
  async create(identity: RequestIdentity, dto: CreateLeadDto) {
    if (dto.customerId && !await this.prisma.customer.findFirst({ where: { id: dto.customerId, tenantId: identity.tenantId, archivedAt: null } })) throw new NotFoundException('Customer not found');
    if (!dto.customerId && !dto.phone && !dto.email) throw new BadRequestException('Pesan masuk memerlukan nomor telepon atau email');
    const count = await this.prisma.lead.count({ where: { tenantId: identity.tenantId } });
    const lead = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({ data: { tenantId: identity.tenantId, leadCode: `LEAD-${String(count + 1).padStart(6, '0')}`, customerId: dto.customerId, senderName:dto.senderName,phone:dto.phone,email:dto.email,message:dto.message,source: dto.source, requirement: dto.requirement??dto.message, destination: dto.destination, travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined, returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined, pax: dto.pax, estimatedValue: dto.estimatedValue, assignedUserId: dto.assignedUserId, priority: dto.priority, notes: dto.notes } });
      await tx.outboxEvent.create({ data: { tenantId: identity.tenantId, eventType: 'lead.created', aggregateType: 'lead', aggregateId: created.id, payload: { event_id: crypto.randomUUID(), event_type: 'lead.created', tenant_id: identity.tenantId, actor_id: identity.userId, aggregate_type: 'lead', aggregate_id: created.id, schema_version: 1 } } });
      return created;
    });
    await this.audit.record(identity, 'lead.created', 'lead', lead.id);
    return lead;
  }
  async list(identity: RequestIdentity, query: { page?: number; pageSize?: number; search?: string; source?: string; status?: string } = {}) {
    const page = Math.max(1, Number(query.page || 1));
    const pageSize = Math.max(1, Math.min(100, Number(query.pageSize || 12)));
    const search = String(query.search || '').trim();
    const where = {
      tenantId: identity.tenantId,
      ...(query.source ? { source: query.source } : {}),
      ...(query.status ? { status: query.status as any } : {}),
      ...(search ? {
        OR: [
          { leadCode: { contains: search, mode: 'insensitive' as const } },
          { senderName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { message: { contains: search, mode: 'insensitive' as const } },
        ],
      } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({ where, include: { customer: true, followUps: { orderBy: { dueAt: 'desc' } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }
  async find(identity: RequestIdentity, id: string) { const lead = await this.prisma.lead.findFirst({ where: { id, tenantId: identity.tenantId }, include: { customer: true,followUps:{orderBy:{dueAt:'desc'}} } }); if (!lead) throw new NotFoundException('Lead not found'); return lead; }
  async update(identity: RequestIdentity, id: string, dto: UpdateLeadDto) { await this.find(identity, id); const lead = await this.prisma.lead.update({ where: { id }, data: { ...dto, travelDate: dto.travelDate ? new Date(dto.travelDate) : undefined, returnDate: dto.returnDate ? new Date(dto.returnDate) : undefined,nextFollowUpAt:dto.nextFollowUpAt?new Date(dto.nextFollowUpAt):undefined } }); await this.audit.record(identity, 'lead.updated', 'lead', id); return lead; }
  async verify(identity:RequestIdentity,id:string,dto:VerifyLeadDto){const lead=await this.find(identity,id);if(lead.customerId&&lead.verifiedAt)return lead;const phone=dto.phone??lead.phone,email=dto.email??lead.email,name=dto.fullName??lead.senderName;if(!name||(!phone&&!email))throw new BadRequestException('Nama dan kontak diperlukan untuk verifikasi');let customer=await this.prisma.customer.findFirst({where:{tenantId:identity.tenantId,archivedAt:null,OR:[phone?{phone}:undefined,email?{email}:undefined].filter(Boolean) as any}});if(!customer){const count=await this.prisma.customer.count({where:{tenantId:identity.tenantId}});customer=await this.prisma.customer.create({data:{tenantId:identity.tenantId,customerCode:`CUS-${String(count+1).padStart(6,'0')}`,fullName:name,phone,email,leadSource:lead.source,notes:dto.notes??`Dibuat dari ${lead.leadCode}`}})}const updated=await this.prisma.lead.update({where:{id},data:{customerId:customer.id,verifiedAt:new Date()}});await this.audit.record(identity,'lead.verified','lead',id,{customerId:customer.id});return updated}
  async addFollowUp(identity:RequestIdentity,id:string,dto:CreateFollowUpDto){const lead=await this.find(identity,id);if(!lead.customerId)throw new BadRequestException('Lead harus diverifikasi sebelum membuat follow-up');const item=await this.prisma.followUp.create({data:{tenantId:identity.tenantId,customerId:lead.customerId,leadId:id,assignedUserId:identity.userId,dueAt:new Date(dto.dueAt),channel:dto.channel,subject:dto.subject,notes:dto.notes,nextAction:dto.nextAction,nextFollowUpAt:dto.nextFollowUpAt?new Date(dto.nextFollowUpAt):undefined}});await this.prisma.lead.update({where:{id},data:{nextFollowUpAt:item.nextFollowUpAt??item.dueAt}});return item}
  async updateFollowUp(identity:RequestIdentity,id:string,dto:UpdateFollowUpDto){const item=await this.prisma.followUp.findFirst({where:{id,tenantId:identity.tenantId}});if(!item)throw new NotFoundException('Follow-up tidak ditemukan');return this.prisma.followUp.update({where:{id},data:{status:dto.status,result:dto.result,nextAction:dto.nextAction,nextFollowUpAt:dto.nextFollowUpAt?new Date(dto.nextFollowUpAt):undefined,completedAt:dto.status==='COMPLETED'?new Date():undefined}})}
  async remove(identity: RequestIdentity, id: string) { const lead = await this.find(identity, id); await this.prisma.lead.update({ where: { id }, data: { status: 'LOST', notes: lead.notes ? `${lead.notes}\nDeleted via CRM` : 'Deleted via CRM' } }); await this.audit.record(identity, 'lead.deleted', 'lead', id); return { id: lead.id, deleted: true }; }
  async transition(identity: RequestIdentity, id: string, dto: TransitionLeadDto) {
    const lead = await this.find(identity, id);
    validateLeadTransition(lead.status, dto.status, dto.reason);
    if (dto.status === 'QUALIFIED' && (!lead.requirement || !lead.travelDate || !lead.pax)) throw new BadRequestException('Requirement, travel date, and pax are required before qualifying a lead');
    const data: { status: LeadStatus; firstContactAt?: Date } = { status: dto.status };
    if (dto.status === 'CONTACTED') data.firstContactAt = lead.firstContactAt ?? new Date();
    const updated = await this.prisma.lead.update({ where: { id }, data });
    await this.audit.record(identity, `lead.${dto.status.toLowerCase()}`, 'lead', id, dto.reason ? { reason: dto.reason } : undefined);
    return updated;
  }
}
