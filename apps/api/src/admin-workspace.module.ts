import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ArchiveCategory, AssetStatus, KnowledgeStatus } from '@prisma/client';
import { PrismaService } from './core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from './core/request-context.js';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, IsUUID, Matches, MaxLength } from 'class-validator';
import { PageQueryDto } from './connected-dto.js';

class PackageReviewDto {
  @IsEnum(['SUBMIT','APPROVE','REJECT'] as const) action!: 'SUBMIT'|'APPROVE'|'REJECT';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}
class ArticleDto {
  @IsString() @MaxLength(180) title!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @IsOptional() @IsString() @MaxLength(500) excerpt?: string;
  @IsString() @MaxLength(100000) content!: string;
  @IsOptional() @IsUrl({require_tld:false}) coverImage?: string;
  @IsOptional() @IsEnum(['DRAFT','PUBLISHED','ARCHIVED'] as const) status?: 'DRAFT'|'PUBLISHED'|'ARCHIVED';
}
class MediaDto {
  @IsString() @MaxLength(255) originalName!: string;
  @IsUrl({require_tld:false}) url!: string;
  @IsOptional() @IsString() @MaxLength(100) mimeType?: string;
  @IsOptional() @IsString() @MaxLength(300) altText?: string;
  @IsOptional() @IsString() @MaxLength(60) category?: string;
}
class AssetDto {
  @IsString() @Matches(/^[A-Z0-9][A-Z0-9-]{1,39}$/) assetCode!: string;
  @IsString() @MaxLength(180) name!: string;
  @IsString() @MaxLength(120) category!: string;
  @IsOptional() @IsString() @MaxLength(120) brand?: string;
  @IsOptional() @IsString() @MaxLength(180) serialNumber?: string;
  @IsOptional() @IsEnum(AssetStatus) status?: AssetStatus;
  @IsOptional() @IsUUID() assignedToId?: string;
  @IsOptional() @IsString() @MaxLength(300) location?: string;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
}
class KnowledgeDto {
  @IsString() @MaxLength(240) title!: string;
  @IsString() @MaxLength(120) category!: string;
  @IsOptional() @IsString() @MaxLength(1000) summary?: string;
  @IsString() @MaxLength(100000) content!: string;
  @IsOptional() @IsEnum(KnowledgeStatus) status?: KnowledgeStatus;
}
class ArchiveDto {
  @IsString() @MaxLength(240) title!: string;
  @IsEnum(ArchiveCategory) category!: ArchiveCategory;
  @IsString() @MaxLength(255) fileName!: string;
  @IsUrl({ require_tld: false }) fileUrl!: string;
  @IsOptional() @IsString() @MaxLength(120) mimeType?: string;
  @IsOptional() @IsString() @MaxLength(1000) tags?: string;
  @IsOptional() @IsString() @MaxLength(5000) notes?: string;
  @IsOptional() @IsDateString() documentDate?: string;
  @IsOptional() @IsDateString() expiresAt?: string;
}

function imageMatchesMime(buffer: Buffer, mimeType: string) {
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimeType === 'image/webp') return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  return false;
}

@Injectable()
class AdminWorkspaceService {
  constructor(@Inject(PrismaService) private readonly p: PrismaService) {}

  private page(query: PageQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    return { page, pageSize, skip: (page - 1) * pageSize };
  }

  private result<T>(items: T[], total: number, page: number, pageSize: number) {
    return { items, meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } };
  }

  async dashboard(i: RequestIdentity) {
    const [leads, customers, bookings, invoices, tasks, trips] = await Promise.all([
      i.permissions.has('lead.read') ? this.p.lead.count({ where: { tenantId: i.tenantId, status: { notIn: ['WON','LOST'] } } }) : Promise.resolve(null),
      i.permissions.has('customer.read') ? this.p.customer.count({ where: { tenantId: i.tenantId, archivedAt: null } }) : Promise.resolve(null),
      i.permissions.has('booking.read') ? this.p.booking.count({ where: { tenantId: i.tenantId, status: { notIn: ['CANCELLED','REFUNDED','COMPLETED'] } } }) : Promise.resolve(null),
      i.permissions.has('invoice.read') ? this.p.invoice.aggregate({ where: { tenantId: i.tenantId, status: { in: ['ISSUED','PARTIALLY_PAID','OVERDUE'] } }, _sum: { totalAmount: true, paidAmount: true } }) : Promise.resolve(null),
      this.p.task.findMany({ where: { tenantId: i.tenantId, OR: [{ assigneeId: i.userId }, { participants: { some: { userId: i.userId } } }], status: { notIn: ['DONE','CANCELLED'] } }, include: { project: { select: { name: true } } }, orderBy: { dueDate: 'asc' }, take: 8 }),
      this.p.trip.findMany({ where: { tenantId: i.tenantId, assignments: { some: { employeeId: i.userId } }, status: { notIn: ['COMPLETED','CANCELLED'] } }, orderBy: { startsAt: 'asc' }, take: 8 }),
    ]);
    const outstanding = invoices ? Number(invoices._sum.totalAmount ?? 0) - Number(invoices._sum.paidAmount ?? 0) : null;
    return { leads, customers, bookings, outstanding, myTasks: tasks, myTrips: trips };
  }

  async packages(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,archivedAt:null,...(search?{OR:[{packageCode:{contains:search,mode:'insensitive' as const}},{name:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.travelPackage.findMany({where,select:{id:true,packageCode:true,name:true,status:true,approvalStatus:true,submittedAt:true,reviewedAt:true,reviewNote:true,submittedBy:{select:{name:true}},reviewedBy:{select:{name:true}}},orderBy:{updatedAt:'desc'},skip,take:pageSize}),this.p.travelPackage.count({where})]);return this.result(items,total,page,pageSize)}
  async reviewPackage(i:RequestIdentity,id:string,d:PackageReviewDto){const current=await this.p.travelPackage.findFirst({where:{id,tenantId:i.tenantId,archivedAt:null}});if(!current)throw new BadRequestException('Paket tidak ditemukan');if(d.action!=='SUBMIT'&&!i.permissions.has('package.approve'))throw new BadRequestException('Anda tidak memiliki izin approval paket');if(d.action==='SUBMIT'&&!['DRAFT','REJECTED'].includes(current.approvalStatus))throw new BadRequestException('Paket tidak dapat diajukan dari status saat ini');if(d.action!=='SUBMIT'&&current.approvalStatus!=='PENDING_REVIEW')throw new BadRequestException('Paket belum menunggu review');if(d.action==='REJECT'&&!d.note?.trim())throw new BadRequestException('Catatan wajib untuk penolakan');return this.p.$transaction(async tx=>{const updated=await tx.travelPackage.update({where:{id},data:d.action==='SUBMIT'?{approvalStatus:'PENDING_REVIEW',submittedById:i.userId,submittedAt:new Date()}:{approvalStatus:d.action==='APPROVE'?'APPROVED':'REJECTED',reviewedById:i.userId,reviewedAt:new Date(),reviewNote:d.note,status:d.action==='APPROVE'?'ACTIVE':undefined}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:`package.${d.action.toLowerCase()}`,resourceType:'TravelPackage',resourceId:id,requestId:i.requestId,metadata:{fromApprovalStatus:current.approvalStatus,toApprovalStatus:updated.approvalStatus,note:d.note??null}}});return updated})}

  async articles(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{title:{contains:search,mode:'insensitive' as const}},{slug:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.article.findMany({where,orderBy:{updatedAt:'desc'},skip,take:pageSize}),this.p.article.count({where})]);return this.result(items,total,page,pageSize)}
  createArticle(i:RequestIdentity,d:ArticleDto){return this.p.article.create({data:{tenantId:i.tenantId,authorId:i.userId,slug:d.slug,title:d.title,excerpt:d.excerpt,content:d.content,coverImage:d.coverImage,status:d.status??'DRAFT',publishedAt:d.status==='PUBLISHED'?new Date():undefined}})}
  updateArticle(i:RequestIdentity,id:string,d:ArticleDto){return this.p.article.updateMany({where:{id,tenantId:i.tenantId},data:{title:d.title,excerpt:d.excerpt,content:d.content,coverImage:d.coverImage,status:d.status,publishedAt:d.status==='PUBLISHED'?new Date():undefined}})}

  async media(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{originalName:{contains:search,mode:'insensitive' as const}},{altText:{contains:search,mode:'insensitive' as const}},{category:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.websiteMediaFile.findMany({where,orderBy:{createdAt:'desc'},skip,take:pageSize}),this.p.websiteMediaFile.count({where})]);return this.result(items,total,page,pageSize)}
  createMedia(i:RequestIdentity,d:MediaDto){return this.p.websiteMediaFile.create({data:{tenantId:i.tenantId,uploadedById:i.userId,originalName:d.originalName,storedName:d.originalName,mimeType:d.mimeType??'image/webp',size:0,url:d.url,altText:d.altText,category:d.category??'WEBSITE'}})}
  async uploadMedia(i:RequestIdentity,request:any){const file=await request.file();if(!file)throw new BadRequestException('Pilih satu file');const allowed=new Set(['image/png','image/jpeg','image/webp']);if(!allowed.has(file.mimetype))throw new BadRequestException('Format harus PNG, JPEG, atau WEBP');const buffer=await file.toBuffer();if(!buffer.length)throw new BadRequestException('File media kosong');if(!imageMatchesMime(buffer,file.mimetype))throw new BadRequestException('Isi file tidak sesuai dengan MIME type');const url=process.env.SUPABASE_URL?.replace(/\/$/,''),secret=process.env.SUPABASE_SECRET_KEY,bucket=process.env.SUPABASE_MEDIA_BUCKET??'erp-media';if(!url||!secret)throw new BadRequestException('Supabase Storage belum dikonfigurasi');const safe=file.filename.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-180)||'media',storedName=`${i.tenantId}/${randomUUID()}-${safe}`;const upload=await fetch(`${url}/storage/v1/object/${bucket}/${storedName}`,{method:'POST',headers:{authorization:`Bearer ${secret}`,apikey:secret,'content-type':file.mimetype,'x-upsert':'false'},body:buffer});if(!upload.ok)throw new BadRequestException('Upload media gagal');const publicUrl=`${url}/storage/v1/object/public/${bucket}/${storedName}`;return this.p.websiteMediaFile.create({data:{tenantId:i.tenantId,uploadedById:i.userId,originalName:file.filename,storedName,mimeType:file.mimetype,size:buffer.length,url:publicUrl,category:'WEBSITE'}})}

  async assets(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{assetCode:{contains:search,mode:'insensitive' as const}},{name:{contains:search,mode:'insensitive' as const}},{serialNumber:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.teamAsset.findMany({where,include:{assignedTo:{select:{name:true}}},orderBy:{updatedAt:'desc'},skip,take:pageSize}),this.p.teamAsset.count({where})]);return this.result(items,total,page,pageSize)}
  async createAsset(i:RequestIdentity,d:AssetDto){if(d.assignedToId&&!await this.p.user.findFirst({where:{id:d.assignedToId,tenantId:i.tenantId,active:true},select:{id:true}}))throw new BadRequestException('Karyawan penerima aset tidak valid');return this.p.$transaction(async tx=>{const row=await tx.teamAsset.create({data:{tenantId:i.tenantId,assetCode:d.assetCode.trim(),name:d.name.trim(),category:d.category.trim(),brand:d.brand,serialNumber:d.serialNumber,status:d.status??'AVAILABLE',assignedToId:d.assignedToId,location:d.location,notes:d.notes}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:'asset.created',resourceType:'TeamAsset',resourceId:row.id,requestId:i.requestId,metadata:{assetCode:row.assetCode,assignedToId:d.assignedToId??null}}});return row})}
  async knowledge(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{title:{contains:search,mode:'insensitive' as const}},{category:{contains:search,mode:'insensitive' as const}},{summary:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.knowledgeDocument.findMany({where,include:{owner:{select:{name:true}}},orderBy:{revisedAt:'desc'},skip,take:pageSize}),this.p.knowledgeDocument.count({where})]);return this.result(items,total,page,pageSize)}
  createKnowledge(i:RequestIdentity,d:KnowledgeDto){return this.p.$transaction(async tx=>{const row=await tx.knowledgeDocument.create({data:{tenantId:i.tenantId,title:d.title.trim(),category:d.category.trim(),summary:d.summary,content:d.content,status:d.status??'DRAFT',ownerId:i.userId,lastRevisedById:i.userId}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:'knowledge.created',resourceType:'KnowledgeDocument',resourceId:row.id,requestId:i.requestId}});return row})}

  async archives(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{title:{contains:search,mode:'insensitive' as const}},{fileName:{contains:search,mode:'insensitive' as const}},{tags:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.fileArchive.findMany({where,orderBy:{createdAt:'desc'},skip,take:pageSize}),this.p.fileArchive.count({where})]);return this.result(items,total,page,pageSize)}
  async createArchive(i:RequestIdentity,d:ArchiveDto){const storageBase=process.env.SUPABASE_URL?.replace(/\/$/,'');if(!storageBase)throw new BadRequestException('Supabase Storage belum dikonfigurasi');const supplied=new URL(d.fileUrl),expected=new URL(storageBase);if(supplied.origin!==expected.origin||!supplied.pathname.startsWith('/storage/v1/object/')||!supplied.pathname.includes(`/${i.tenantId}/`))throw new BadRequestException('Arsip harus berasal dari folder tenant di Supabase Storage');return this.p.$transaction(async tx=>{const row=await tx.fileArchive.create({data:{tenantId:i.tenantId,title:d.title.trim(),category:d.category,fileName:d.fileName.trim(),fileUrl:d.fileUrl,mimeType:d.mimeType,tags:d.tags,notes:d.notes,uploadedById:i.userId,documentDate:d.documentDate?new Date(d.documentDate):undefined,expiresAt:d.expiresAt?new Date(d.expiresAt):undefined}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:'archive.created',resourceType:'FileArchive',resourceId:row.id,requestId:i.requestId,metadata:{category:d.category,fileName:d.fileName}}});return row})}
}
@UseGuards(IdentityGuard,PermissionGuard) @Controller() class AdminWorkspaceController{
 constructor(@Inject(AdminWorkspaceService)private readonly s:AdminWorkspaceService){}
 @Get('dashboard/role') dashboard(@CurrentIdentity()i:RequestIdentity){return this.s.dashboard(i)}
 @Get('package-reviews') @Permissions('package.read') packages(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.packages(i,q)}
 @Patch('package-reviews/:id') @Permissions('package.update') review(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:PackageReviewDto){return this.s.reviewPackage(i,id,d)}
 @Get('content/articles') @Permissions('content.read') articles(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.articles(i,q)}
 @Post('content/articles') @Permissions('content.manage') createArticle(@CurrentIdentity()i:RequestIdentity,@Body()d:ArticleDto){return this.s.createArticle(i,d)}
 @Patch('content/articles/:id') @Permissions('content.manage') updateArticle(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:ArticleDto){return this.s.updateArticle(i,id,d)}
 @Get('media') @Permissions('media.read') media(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.media(i,q)}
 @Post('media') @Permissions('media.manage') createMedia(@CurrentIdentity()i:RequestIdentity,@Body()d:MediaDto){return this.s.createMedia(i,d)}
 @Post('media/upload') @Permissions('media.manage') uploadMedia(@CurrentIdentity()i:RequestIdentity,@Req()request:any){return this.s.uploadMedia(i,request)}
 @Get('assets') @Permissions('asset.read') assets(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.assets(i,q)}
 @Post('assets') @Permissions('asset.manage') createAsset(@CurrentIdentity()i:RequestIdentity,@Body()d:AssetDto){return this.s.createAsset(i,d)}
 @Get('knowledge') @Permissions('knowledge.read') knowledge(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.knowledge(i,q)}
 @Post('knowledge') @Permissions('knowledge.manage') createKnowledge(@CurrentIdentity()i:RequestIdentity,@Body()d:KnowledgeDto){return this.s.createKnowledge(i,d)}
 @Get('archives') @Permissions('archive.read') archives(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.archives(i,q)}
 @Post('archives') @Permissions('archive.manage') createArchive(@CurrentIdentity()i:RequestIdentity,@Body()d:ArchiveDto){return this.s.createArchive(i,d)}
}
@Module({controllers:[AdminWorkspaceController],providers:[AdminWorkspaceService,PrismaService,IdentityGuard,PermissionGuard]})export class AdminWorkspaceModule{}
