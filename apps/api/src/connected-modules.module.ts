import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from './core/request-context.js';

const taskInclude = { project: { include: { milestones: true } }, assignee: { select: { id: true, name: true } }, milestone: true, participants: { include: { user: { select: { id: true, name: true } } } }, comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'desc' as const }, take: 5 } };

@Injectable()
class ConnectedModulesService {
  constructor(@Inject(PrismaService) private readonly p: PrismaService) {}

  employees(i: RequestIdentity) { return this.p.user.findMany({ where: { tenantId: i.tenantId, active: true }, select: { id: true, name: true, jobTitle: true }, orderBy: { name: 'asc' },take:100 }); }
  projects(i: RequestIdentity) { return this.p.project.findMany({ where: { tenantId: i.tenantId }, include: { milestones: { orderBy: { dueDate: 'asc' } } }, orderBy: { updatedAt: 'desc' },take:100 }); }
  trips(i: RequestIdentity) { return this.p.trip.findMany({ where: { tenantId: i.tenantId }, include: { booking: { select: { bookingCode: true, pax: true, customer: { select: { fullName: true } } } }, assignments: { include: { employee: { select: { name: true, jobTitle: true } } } } }, orderBy: { startsAt: 'asc' },take:100 }); }
  vendors(i: RequestIdentity) { return this.p.vendor.findMany({ where: { tenantId: i.tenantId, status: 'ACTIVE' }, select: { id: true, name: true, category: true }, orderBy: { name: 'asc' },take:100 }); }
  departures(i: RequestIdentity) { return this.p.packageDeparture.findMany({ where: { tenantId: i.tenantId }, include: { package: { select: { id: true, name: true } }, _count: { select: { bookings: true } } }, orderBy: { startsAt: 'asc' },take:100 }); }
  tasks(i: RequestIdentity) { return this.p.task.findMany({ where: { tenantId: i.tenantId }, include: taskInclude, orderBy: { updatedAt: 'desc' },take:100 }); }

  async createTask(i: RequestIdentity, d: any) {
    const project = await this.p.project.findFirst({ where: { id: d.projectId, tenantId: i.tenantId }, select: { id: true } });
    if (!project) throw new BadRequestException('Proyek tidak valid');
    const userIds = [...new Set([d.assigneeId, ...(d.participantIds ?? [])].filter(Boolean))] as string[];
    if (userIds.length && await this.p.user.count({ where: { id: { in: userIds }, tenantId: i.tenantId, active: true } }) !== userIds.length) throw new BadRequestException('Karyawan tidak valid');
    return this.p.$transaction(async tx => {
      const task = await tx.task.create({ data: { tenantId: i.tenantId, projectId: d.projectId, title: String(d.title), description: d.description, assigneeId: d.assigneeId, milestoneId: d.milestoneId, priority: d.priority ?? 'NORMAL', startDate: d.startDate ? new Date(d.startDate) : undefined, dueDate: d.dueDate ? new Date(d.dueDate) : undefined } });
      if (d.participantIds?.length) await tx.taskParticipant.createMany({ data: d.participantIds.map((userId: string) => ({ tenantId: i.tenantId, taskId: task.id, userId })) });
      return tx.task.findUniqueOrThrow({ where: { id: task.id }, include: taskInclude });
    });
  }

  async updateTask(i: RequestIdentity, id: string, d: any) {
    const task = await this.p.task.findFirst({ where: { id, tenantId: i.tenantId } });
    if (!task) throw new NotFoundException('Task tidak ditemukan');
    return this.p.$transaction(async tx => {
      const updated = await tx.task.update({ where: { id }, data: { status: d.status, progress: d.progress, completedAt: d.status === 'DONE' ? new Date() : d.status ? null : undefined } });
      if (d.comment) await tx.taskComment.create({ data: { tenantId: i.tenantId, taskId: id, authorId: i.userId, message: String(d.comment), type: 'STATUS_CHANGE', statusFrom: task.status, statusTo: d.status } });
      return updated;
    });
  }

  async comment(i: RequestIdentity, id: string, d: any) {
    if (!await this.p.task.findFirst({ where: { id, tenantId: i.tenantId }, select: { id: true } })) throw new NotFoundException('Task tidak ditemukan');
    return this.p.taskComment.create({ data: { tenantId: i.tenantId, taskId: id, authorId: i.userId, message: String(d.message), type: d.type ?? 'NOTE' } });
  }

  async cashflow(i: RequestIdentity, year: number, month: number) {
    const from = new Date(Date.UTC(year, month - 1, 1)), to = new Date(Date.UTC(year, month, 1));
    const entries = await this.p.financialEntry.findMany({ where: { tenantId: i.tenantId, transactionDate: { gte: from, lt: to } }, include: { project: { select: { name: true } }, trip: { select: { title: true } }, vendor: { select: { name: true } } }, orderBy: { transactionDate: 'desc' } });
    const income = entries.filter(x => x.direction === 'IN').reduce((s, x) => s + Number(x.amount), 0), expense = entries.filter(x => x.direction === 'OUT').reduce((s, x) => s + Number(x.amount), 0);
    return { entries, summary: { income, expense, net: income - expense } };
  }

  createCashflow(i: RequestIdentity, d: any) { return this.p.financialEntry.create({ data: { tenantId: i.tenantId, recordedById: i.userId, direction: d.direction, costType: d.costType, category: String(d.category), description: String(d.description), amount: Number(d.amount), transactionDate: new Date(d.transactionDate), reference: d.reference, fixedCost: Boolean(d.fixedCost), notes: d.notes, projectId: d.projectId, tripId: d.tripId, vendorId: d.vendorId } }); }

  async report(i: RequestIdentity, q: any) {
    const year = Number(q.year), month = q.month ? Number(q.month) : undefined;
    const from = new Date(Date.UTC(year, month ? month - 1 : 0, 1)), to = new Date(Date.UTC(month ? year : year + 1, month ?? 0, 1));
    const bp=Math.max(1,Number(q.bookingPage||1)),bps=Math.max(1,Math.min(100,Number(q.bookingPageSize||10))),pp=Math.max(1,Number(q.paymentPage||1)),pps=Math.max(1,Math.min(100,Number(q.paymentPageSize||10)));
    const bookingWhere={tenantId:i.tenantId,createdAt:{gte:from,lt:to}},paymentWhere={tenantId:i.tenantId,receivedAt:{gte:from,lt:to}};
    const [bookings,payments,bookingTotals,paymentCount,receivedTotals] = await Promise.all([
      this.p.booking.findMany({where:bookingWhere,select:{createdAt:true,bookingCode:true,packageName:true,travelDate:true,pax:true,status:true,totalAmount:true,paidAmount:true,customer:{select:{fullName:true,phone:true}}},orderBy:{createdAt:'desc'},skip:(bp-1)*bps,take:bps}),
      this.p.payment.findMany({where:paymentWhere,select:{receivedAt:true,paymentNumber:true,method:true,status:true,amount:true,customer:{select:{fullName:true}},invoice:{select:{invoiceNumber:true}},receivedBy:{select:{name:true}}},orderBy:{receivedAt:'desc'},skip:(pp-1)*pps,take:pps}),
      this.p.booking.aggregate({where:bookingWhere,_count:{_all:true},_sum:{pax:true,totalAmount:true}}),
      this.p.payment.count({where:paymentWhere}),
      this.p.payment.aggregate({where:{...paymentWhere,status:'VERIFIED'},_sum:{amount:true}}),
    ]);
    const bs = bookings.map(x => ({ tanggal: x.createdAt, kode: x.bookingCode, pelanggan: x.customer.fullName, telepon: x.customer.phone, paket: x.packageName, tanggalTrip: x.travelDate, pax: x.pax, status: x.status, total: Number(x.totalAmount), dibayar: Number(x.paidAmount) }));
    const ps = payments.map(x => ({ tanggal: x.receivedAt, nomor: x.paymentNumber, invoice: x.invoice.invoiceNumber, pelanggan: x.customer.fullName, metode: x.method, status: x.status, jumlah: Number(x.amount), diterimaOleh: x.receivedBy?.name ?? '-' }));
    const bookingCount=bookingTotals._count._all,invoiced=Number(bookingTotals._sum.totalAmount??0),received=Number(receivedTotals._sum.amount??0);
    return { period: month ? `${year}-${String(month).padStart(2,'0')}` : String(year), summary:{bookingCount,pax:Number(bookingTotals._sum.pax??0),bookingValue:invoiced,invoiced,received,outstanding:Math.max(0,invoiced-received),paymentCount},bookings:bs,payments:ps,bookingsMeta:{page:bp,pageSize:bps,total:bookingCount,totalPages:Math.max(1,Math.ceil(bookingCount/bps))},paymentsMeta:{page:pp,pageSize:pps,total:paymentCount,totalPages:Math.max(1,Math.ceil(paymentCount/pps))} };
  }

  async profile(i: RequestIdentity) { return this.p.companyProfile.findUnique({ where: { tenantId: i.tenantId } }); }
  async updateProfile(i: RequestIdentity, d: any) {
    const allowed = ['vision','mission','coreValues','customerTerms','privacyPolicy','cancellationPolicy','websiteLogoUrl','erpLogoUrl','documentLogoUrl','homepageSections','heroTitle','heroSubtitle','heroImageUrl','heroBadge','heroCtaPrimary','heroCtaSecondary','featureHeadline','featureText','howToBookTitle','howToBookText','aboutTitle','aboutText','whatsappNumber','whatsappNumberSecondary','contactEmail','contactAddress','contactHours','instagramUrl','facebookUrl','tiktokUrl','youtubeUrl'];
    const data = Object.fromEntries(allowed.filter(k => k in d).map(k => [k, d[k] || null]));
    return this.p.companyProfile.upsert({ where: { tenantId: i.tenantId }, update: { ...data, revisedById: i.userId }, create: { tenantId: i.tenantId, vision: d.vision || 'Menjadi partner perjalanan terpercaya dari Batam.', mission: d.mission || 'Memberikan perjalanan yang aman, transparan, dan berkesan.', ...data, revisedById: i.userId } });
  }
}
@UseGuards(IdentityGuard,PermissionGuard) @Controller() class ConnectedController {
  constructor(@Inject(ConnectedModulesService) private readonly s:ConnectedModulesService){}
  @Get('employees') @Permissions('employee.read') employees(@CurrentIdentity()i:RequestIdentity){return this.s.employees(i)}
  @Get('projects') @Permissions('project.read') projects(@CurrentIdentity()i:RequestIdentity){return this.s.projects(i)}
  @Get('trips') @Permissions('trip.read') trips(@CurrentIdentity()i:RequestIdentity){return this.s.trips(i)}
  @Get('vendors') @Permissions('vendor.read') vendors(@CurrentIdentity()i:RequestIdentity){return this.s.vendors(i)}
  @Get('open-trips') @Permissions('trip.read') departures(@CurrentIdentity()i:RequestIdentity){return this.s.departures(i)}
  @Get('tasks') @Permissions('task.read') tasks(@CurrentIdentity()i:RequestIdentity){return this.s.tasks(i)}
  @Post('tasks') @Permissions('task.create') createTask(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createTask(i,d)}
  @Patch('tasks/:id') @Permissions('task.update') updateTask(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:any){return this.s.updateTask(i,id,d)}
  @Post('tasks/:id/comments') @Permissions('task.update') comment(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:any){return this.s.comment(i,id,d)}
  @Get('cashflow') @Permissions('payment.read') cashflow(@CurrentIdentity()i:RequestIdentity,@Query('year')y:string,@Query('month')m:string){return this.s.cashflow(i,Number(y),Number(m))}
  @Post('cashflow') @Permissions('payment.manage') createCashflow(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createCashflow(i,d)}
  @Get('reports/business') @Permissions('dashboard.owner') report(@CurrentIdentity()i:RequestIdentity,@Query()q:any){return this.s.report(i,q)}
  @Get('asset-knowledge/profile') profile(@CurrentIdentity()i:RequestIdentity){return this.s.profile(i)}
  @Patch('asset-knowledge/profile') @Permissions('knowledge.manage') updateProfile(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.updateProfile(i,d)}
}
@Module({controllers:[ConnectedController],providers:[ConnectedModulesService,PrismaService,IdentityGuard,PermissionGuard]}) export class ConnectedModulesModule {}
