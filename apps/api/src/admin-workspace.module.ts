import { Body, Controller, Get, Inject, Injectable, Module, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from './core/request-context.js';

@Injectable()
class AdminWorkspaceService {
  constructor(@Inject(PrismaService) private readonly p: PrismaService) {}

  async dashboard(i: RequestIdentity) {
    const [leads, customers, bookings, invoices, tasks, trips] = await Promise.all([
      this.p.lead.count({ where: { tenantId: i.tenantId, status: { notIn: ['WON','LOST'] } } }),
      this.p.customer.count({ where: { tenantId: i.tenantId, archivedAt: null } }),
      this.p.booking.count({ where: { tenantId: i.tenantId, status: { notIn: ['CANCELLED','REFUNDED','COMPLETED'] } } }),
      this.p.invoice.aggregate({ where: { tenantId: i.tenantId, status: { in: ['ISSUED','PARTIALLY_PAID','OVERDUE'] } }, _sum: { totalAmount: true, paidAmount: true } }),
      this.p.task.findMany({ where: { tenantId: i.tenantId, OR: [{ assigneeId: i.userId }, { participants: { some: { userId: i.userId } } }], status: { notIn: ['DONE','CANCELLED'] } }, include: { project: { select: { name: true } } }, orderBy: { dueDate: 'asc' }, take: 8 }),
      this.p.trip.findMany({ where: { tenantId: i.tenantId, assignments: { some: { employeeId: i.userId } }, status: { notIn: ['COMPLETED','CANCELLED'] } }, orderBy: { startsAt: 'asc' }, take: 8 }),
    ]);
    const outstanding = Number(invoices._sum.totalAmount ?? 0) - Number(invoices._sum.paidAmount ?? 0);
    return { leads, customers, bookings, outstanding, myTasks: tasks, myTrips: trips };
  }

  packages(i:RequestIdentity){return this.p.travelPackage.findMany({where:{tenantId:i.tenantId,archivedAt:null},select:{id:true,packageCode:true,name:true,status:true,approvalStatus:true,submittedAt:true,reviewedAt:true,reviewNote:true,submittedBy:{select:{name:true}},reviewedBy:{select:{name:true}}},orderBy:{updatedAt:'desc'}})}
  reviewPackage(i:RequestIdentity,id:string,d:any){return this.p.travelPackage.updateMany({where:{id,tenantId:i.tenantId},data:d.action==='SUBMIT'?{approvalStatus:'PENDING_REVIEW',submittedById:i.userId,submittedAt:new Date()}:{approvalStatus:d.action==='APPROVE'?'APPROVED':'REJECTED',reviewedById:i.userId,reviewedAt:new Date(),reviewNote:d.note,status:d.action==='APPROVE'?'ACTIVE':undefined}})}

  articles(i:RequestIdentity){return this.p.article.findMany({where:{tenantId:i.tenantId},orderBy:{updatedAt:'desc'}})}
  createArticle(i:RequestIdentity,d:any){return this.p.article.create({data:{tenantId:i.tenantId,authorId:i.userId,slug:String(d.slug),title:String(d.title),excerpt:d.excerpt,content:String(d.content),coverImage:d.coverImage,status:d.status??'DRAFT',publishedAt:d.status==='PUBLISHED'?new Date():undefined}})}
  updateArticle(i:RequestIdentity,id:string,d:any){return this.p.article.updateMany({where:{id,tenantId:i.tenantId},data:{title:d.title,excerpt:d.excerpt,content:d.content,coverImage:d.coverImage,status:d.status,publishedAt:d.status==='PUBLISHED'?new Date():undefined}})}

  media(i:RequestIdentity){return this.p.websiteMediaFile.findMany({where:{tenantId:i.tenantId},orderBy:{createdAt:'desc'}})}
  createMedia(i:RequestIdentity,d:any){return this.p.websiteMediaFile.create({data:{tenantId:i.tenantId,uploadedById:i.userId,originalName:String(d.originalName),storedName:String(d.storedName??d.originalName),mimeType:String(d.mimeType??'image/webp'),size:Number(d.size??0),url:String(d.url),altText:d.altText,category:d.category??'WEBSITE'}})}

  assets(i:RequestIdentity){return this.p.teamAsset.findMany({where:{tenantId:i.tenantId},include:{assignedTo:{select:{name:true}}},orderBy:{updatedAt:'desc'}})}
  createAsset(i:RequestIdentity,d:any){return this.p.teamAsset.create({data:{tenantId:i.tenantId,assetCode:String(d.assetCode),name:String(d.name),category:String(d.category),brand:d.brand,serialNumber:d.serialNumber,status:d.status??'AVAILABLE',assignedToId:d.assignedToId,location:d.location,notes:d.notes}})}
  knowledge(i:RequestIdentity){return this.p.knowledgeDocument.findMany({where:{tenantId:i.tenantId},include:{owner:{select:{name:true}}},orderBy:{revisedAt:'desc'}})}
  createKnowledge(i:RequestIdentity,d:any){return this.p.knowledgeDocument.create({data:{tenantId:i.tenantId,title:String(d.title),category:String(d.category),summary:d.summary,content:String(d.content),status:d.status??'DRAFT',ownerId:i.userId,lastRevisedById:i.userId}})}

  archives(i:RequestIdentity){return this.p.fileArchive.findMany({where:{tenantId:i.tenantId},orderBy:{createdAt:'desc'}})}
  createArchive(i:RequestIdentity,d:any){return this.p.fileArchive.create({data:{tenantId:i.tenantId,title:String(d.title),category:d.category,fileName:String(d.fileName),fileUrl:String(d.fileUrl),mimeType:d.mimeType,tags:d.tags,notes:d.notes,uploadedById:i.userId,documentDate:d.documentDate?new Date(d.documentDate):undefined,expiresAt:d.expiresAt?new Date(d.expiresAt):undefined}})}
}
@UseGuards(IdentityGuard,PermissionGuard) @Controller() class AdminWorkspaceController{
 constructor(@Inject(AdminWorkspaceService)private readonly s:AdminWorkspaceService){}
 @Get('dashboard/role') dashboard(@CurrentIdentity()i:RequestIdentity){return this.s.dashboard(i)}
 @Get('package-reviews') @Permissions('package.read') packages(@CurrentIdentity()i:RequestIdentity){return this.s.packages(i)}
 @Patch('package-reviews/:id') @Permissions('package.update') review(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:any){return this.s.reviewPackage(i,id,d)}
 @Get('content/articles') @Permissions('content.read') articles(@CurrentIdentity()i:RequestIdentity){return this.s.articles(i)}
 @Post('content/articles') @Permissions('content.manage') createArticle(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createArticle(i,d)}
 @Patch('content/articles/:id') @Permissions('content.manage') updateArticle(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:any){return this.s.updateArticle(i,id,d)}
 @Get('media') @Permissions('content.read') media(@CurrentIdentity()i:RequestIdentity){return this.s.media(i)}
 @Post('media') @Permissions('content.manage') createMedia(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createMedia(i,d)}
 @Get('assets') @Permissions('asset.read') assets(@CurrentIdentity()i:RequestIdentity){return this.s.assets(i)}
 @Post('assets') @Permissions('asset.manage') createAsset(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createAsset(i,d)}
 @Get('knowledge') @Permissions('knowledge.read') knowledge(@CurrentIdentity()i:RequestIdentity){return this.s.knowledge(i)}
 @Post('knowledge') @Permissions('knowledge.manage') createKnowledge(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createKnowledge(i,d)}
 @Get('archives') @Permissions('archive.read') archives(@CurrentIdentity()i:RequestIdentity){return this.s.archives(i)}
 @Post('archives') @Permissions('archive.manage') createArchive(@CurrentIdentity()i:RequestIdentity,@Body()d:any){return this.s.createArchive(i,d)}
}
@Module({controllers:[AdminWorkspaceController],providers:[AdminWorkspaceService,PrismaService,IdentityGuard,PermissionGuard]})export class AdminWorkspaceModule{}
