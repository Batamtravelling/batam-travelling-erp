import { BadRequestException, Body, Controller, Get, Inject, Injectable, Module, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ArchiveCategory, AssetStatus, DiscountType, KnowledgeStatus } from '@prisma/client';
import { PrismaService } from './core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from './core/request-context.js';
import { ArrayUnique, IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Matches, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
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
class PromotionDto {
  @IsString() @Matches(/^[A-Z0-9][A-Z0-9-]{1,39}$/) code!: string;
  @IsString() @MaxLength(180) title!: string;
  @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @IsEnum(DiscountType) discountType!: DiscountType;
  @Type(() => Number) @IsNumber({maxDecimalPlaces:2}) @Min(0.01) discountValue!: number;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
  @IsOptional() @IsUrl({require_tld:false}) bannerImage?: string;
  @IsOptional() @IsString() @MaxLength(10000) terms?: string;
  @IsArray() @ArrayUnique() @IsUUID('4',{each:true}) packageIds!: string[];
}
class PromotionReviewDto {
  @IsEnum(['SUBMIT','APPROVE','REJECT','ARCHIVE'] as const) action!: 'SUBMIT'|'APPROVE'|'REJECT'|'ARCHIVE';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
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
export class AdminWorkspaceService {
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

  async promotions(i:RequestIdentity,q:PageQueryDto){const{page,pageSize,skip}=this.page(q),search=q.search?.trim(),where={tenantId:i.tenantId,...(search?{OR:[{title:{contains:search,mode:'insensitive' as const}},{code:{contains:search,mode:'insensitive' as const}}]}:{})};const[items,total]=await Promise.all([this.p.promotion.findMany({where,include:{packages:{select:{package:{select:{id:true,name:true,status:true,approvalStatus:true}}}},submittedBy:{select:{id:true,name:true}},reviewedBy:{select:{id:true,name:true}}},orderBy:{updatedAt:'desc'},skip,take:pageSize}),this.p.promotion.count({where})]);return this.result(items,total,page,pageSize)}
  private async validatePromotionPackages(i:RequestIdentity,packageIds:string[],requirePublic=false){if(!packageIds.length)throw new BadRequestException('Pilih minimal satu paket');const rows=await this.p.travelPackage.findMany({where:{tenantId:i.tenantId,id:{in:packageIds},archivedAt:null},select:{id:true,status:true,approvalStatus:true}});if(rows.length!==packageIds.length)throw new BadRequestException('Satu atau lebih paket tidak valid untuk tenant ini');if(requirePublic&&rows.some(row=>row.status!=='ACTIVE'||row.approvalStatus!=='APPROVED'))throw new BadRequestException('Semua paket promo harus aktif dan sudah disetujui');return rows}
  async createPromotion(i:RequestIdentity,d:PromotionDto){if(new Date(d.endsAt)<=new Date(d.startsAt))throw new BadRequestException('Tanggal akhir promo harus setelah tanggal mulai');await this.validatePromotionPackages(i,d.packageIds);return this.p.$transaction(async tx=>{const row=await tx.promotion.create({data:{tenantId:i.tenantId,code:d.code.trim(),title:d.title.trim(),description:d.description,discountType:d.discountType,discountValue:d.discountValue,startsAt:new Date(d.startsAt),endsAt:new Date(d.endsAt),bannerImage:d.bannerImage,terms:d.terms,packages:{create:d.packageIds.map(packageId=>({tenantId:i.tenantId,packageId}))}}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:'promotion.created',resourceType:'Promotion',resourceId:row.id,requestId:i.requestId}});return row})}
  async updatePromotion(i:RequestIdentity,id:string,d:PromotionDto){const current=await this.p.promotion.findFirst({where:{id,tenantId:i.tenantId}});if(!current)throw new BadRequestException('Promo tidak ditemukan');if(current.status==='ARCHIVED')throw new BadRequestException('Promo yang diarsipkan tidak dapat diubah');if(new Date(d.endsAt)<=new Date(d.startsAt))throw new BadRequestException('Tanggal akhir promo harus setelah tanggal mulai');await this.validatePromotionPackages(i,d.packageIds);return this.p.$transaction(async tx=>{const row=await tx.promotion.update({where:{id},data:{code:d.code.trim(),title:d.title.trim(),description:d.description,discountType:d.discountType,discountValue:d.discountValue,startsAt:new Date(d.startsAt),endsAt:new Date(d.endsAt),bannerImage:d.bannerImage,terms:d.terms,status:'DRAFT',approvalStatus:'DRAFT',submittedById:null,submittedAt:null,reviewedById:null,reviewedAt:null,reviewNote:null,packages:{deleteMany:{},create:d.packageIds.map(packageId=>({tenantId:i.tenantId,packageId}))}}});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:'promotion.updated.requires_review',resourceType:'Promotion',resourceId:id,requestId:i.requestId,metadata:{fromStatus:current.status,fromApprovalStatus:current.approvalStatus}}});return row})}
  async reviewPromotion(i:RequestIdentity,id:string,d:PromotionReviewDto){const current=await this.p.promotion.findFirst({where:{id,tenantId:i.tenantId},include:{packages:true}});if(!current)throw new BadRequestException('Promo tidak ditemukan');if(d.action==='SUBMIT'){if(!['DRAFT','REJECTED'].includes(current.approvalStatus))throw new BadRequestException('Promo tidak dapat diajukan dari status saat ini');await this.validatePromotionPackages(i,current.packages.map(x=>x.packageId),true)}else if(d.action==='ARCHIVE'){if(current.status==='ARCHIVED')throw new BadRequestException('Promo sudah diarsipkan')}else{if(!i.permissions.has('content.approve'))throw new BadRequestException('Anda tidak memiliki izin approval konten');if(current.approvalStatus!=='PENDING_REVIEW')throw new BadRequestException('Promo belum menunggu review');if(current.submittedById===i.userId)throw new BadRequestException('Pengaju promo tidak boleh menyetujui atau menolak pengajuannya sendiri');if(d.action==='REJECT'&&!d.note?.trim())throw new BadRequestException('Catatan wajib untuk penolakan');if(d.action==='APPROVE')await this.validatePromotionPackages(i,current.packages.map(x=>x.packageId),true)}return this.p.$transaction(async tx=>{const data=d.action==='SUBMIT'?{status:'DRAFT' as const,approvalStatus:'PENDING_REVIEW' as const,submittedById:i.userId,submittedAt:new Date(),reviewedById:null,reviewedAt:null,reviewNote:null}:d.action==='APPROVE'?{status:'PUBLISHED' as const,approvalStatus:'APPROVED' as const,reviewedById:i.userId,reviewedAt:new Date(),reviewNote:d.note}:d.action==='REJECT'?{status:'DRAFT' as const,approvalStatus:'REJECTED' as const,reviewedById:i.userId,reviewedAt:new Date(),reviewNote:d.note}:{status:'ARCHIVED' as const};const row=await tx.promotion.update({where:{id},data});await tx.auditLog.create({data:{tenantId:i.tenantId,actorId:i.userId,action:`promotion.${d.action.toLowerCase()}`,resourceType:'Promotion',resourceId:id,requestId:i.requestId,metadata:{fromStatus:current.status,fromApprovalStatus:current.approvalStatus,toStatus:row.status,toApprovalStatus:row.approvalStatus,note:d.note??null}}});return row})}

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
 @Get('content/promotions') @Permissions('content.read') promotions(@CurrentIdentity()i:RequestIdentity,@Query()q:PageQueryDto){return this.s.promotions(i,q)}
 @Post('content/promotions') @Permissions('content.manage') createPromotion(@CurrentIdentity()i:RequestIdentity,@Body()d:PromotionDto){return this.s.createPromotion(i,d)}
 @Patch('content/promotions/:id') @Permissions('content.manage') updatePromotion(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:PromotionDto){return this.s.updatePromotion(i,id,d)}
 @Patch('content/promotions/:id/review') @Permissions('content.manage') reviewPromotion(@CurrentIdentity()i:RequestIdentity,@Param('id')id:string,@Body()d:PromotionReviewDto){return this.s.reviewPromotion(i,id,d)}
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
