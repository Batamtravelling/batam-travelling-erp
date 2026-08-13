import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DepartureStatus, PackageStatus, Prisma, SurchargeBasis } from '@prisma/client';
import { PrismaService } from '../core/prisma.service.js';
import { RequestIdentity } from '../core/request-context.js';
import { summarizeDepartureCapacity } from '../core/departure-capacity-summary.js';

export type PackageInput = {
  packageCode: string;
  name: string;
  destination?: string;
  durationDays?: number;
  sellingPrice?: number;
  status?: PackageStatus;
};
export type DepartureInput = { startsAt:string; endsAt?:string; bookingCloseAt?:string; minPax:number; maxPax:number; meetingPoint?:string; notes?:string; publicNotes?:string; internalNotes?:string; status?:DepartureStatus; surchargeLabel?:string; surchargeAmount?:number; surchargeBasis?:SurchargeBasis };

@Injectable()
export class PackagesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async list(identity: RequestIdentity,query:{page?:number;pageSize?:number;search?:string}={}) {
    const page=Math.max(1,query.page??1),pageSize=Math.max(1,Math.min(100,query.pageSize??20)),search=query.search?.trim();
    const where={tenantId:identity.tenantId,archivedAt:null,...(search?{OR:[{packageCode:{contains:search,mode:'insensitive' as const}},{name:{contains:search,mode:'insensitive' as const}},{destination:{contains:search,mode:'insensitive' as const}}]}:{})};
    const [total,items]=await Promise.all([this.prisma.travelPackage.count({where}),this.prisma.travelPackage.findMany({
      where,
      select: {
        id: true, packageCode: true, name: true, destination: true, durationDays: true,
        adultPrice: true, childPrice: true, infantPrice: true, serviceLevel: true, status: true, approvalStatus: true, minPax: true, maxPax: true,
        prices: { where: { active: true }, orderBy: { priority: 'desc' }, take: 1, select: { sellingPrice: true } },
        departures: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' }, take: 12, select: { id:true,startsAt:true,endsAt:true,bookingCloseAt:true,minPax:true,maxPax:true,status:true,meetingPoint:true,surchargeLabel:true,surchargeAmount:true,surchargeBasis:true,bookings:{where:{tenantId:identity.tenantId,status:{notIn:['CANCELLED','REFUNDED']}},select:{pax:true}} } },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      skip:(page-1)*pageSize,take:pageSize,
    })]);
    const availabilityItems=items.map(item=>({...item,departures:item.departures.map(({bookings,...departure})=>({...departure,...summarizeDepartureCapacity(departure.maxPax,bookings)}))}));
    return{items:availabilityItems,meta:{page,pageSize,total,totalPages:Math.max(1,Math.ceil(total/pageSize))}};
  }

  async create(identity: RequestIdentity, input: PackageInput) {
    const duplicate = await this.prisma.travelPackage.findFirst({
      where: { tenantId: identity.tenantId, packageCode: input.packageCode, archivedAt: null },
      select: { id: true },
    });
    if (duplicate) throw new ConflictException('Kode paket sudah digunakan');

    return this.prisma.$transaction(async (tx) => {
      const travelPackage = await tx.travelPackage.create({
        data: {
          tenantId: identity.tenantId,
          packageCode: input.packageCode,
          name: input.name,
          destination: input.destination,
          durationDays: input.durationDays,
          adultPrice: input.sellingPrice,
          status: input.status ?? 'DRAFT',
        },
      });
      if (input.sellingPrice !== undefined) {
        await tx.packagePrice.create({
          data: {
            tenantId: identity.tenantId,
            packageId: travelPackage.id,
            type: 'STANDARD',
            sellingPrice: input.sellingPrice,
          },
        });
      }
      await tx.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:'package.created',resourceType:'TravelPackage',resourceId:travelPackage.id,requestId:identity.requestId,metadata:{packageCode:travelPackage.packageCode}}});
      return travelPackage;
    });
  }

  async update(identity: RequestIdentity, id: string, updates: Partial<PackageInput>) {
    const current = await this.assertOwned(identity, id);
    if(updates.packageCode&&await this.prisma.travelPackage.findFirst({where:{tenantId:identity.tenantId,packageCode:updates.packageCode,id:{not:id},archivedAt:null},select:{id:true}}))throw new ConflictException('Kode paket sudah digunakan');
    const { sellingPrice, ...packageData } = updates;
    return this.prisma.$transaction(async (tx) => {
      const requiresReview = current.approvalStatus === 'APPROVED' && updates.status !== 'ARCHIVED' && Object.keys(updates).length > 0;
      const travelPackage = await tx.travelPackage.update({
        where: { id },
        data: {
          ...packageData,
          adultPrice: sellingPrice,
          ...(requiresReview ? { status: 'DRAFT', approvalStatus: 'DRAFT', submittedById: null, submittedAt: null, reviewedById: null, reviewedAt: null, reviewNote: null } : {}),
        } as Prisma.TravelPackageUpdateInput,
      });
      if (sellingPrice !== undefined) {
        await tx.packagePrice.updateMany({ where: { tenantId: identity.tenantId, packageId: id, active: true }, data: { active: false } });
        await tx.packagePrice.create({ data: { tenantId: identity.tenantId, packageId: id, type: 'STANDARD', sellingPrice } });
      }
      await tx.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:requiresReview?'package.updated.requires_review':'package.updated',resourceType:'TravelPackage',resourceId:id,requestId:identity.requestId,metadata:{priceChanged:sellingPrice!==undefined,approvalInvalidated:requiresReview}}});
      return travelPackage;
    });
  }

  async remove(identity: RequestIdentity, id: string) {
    await this.assertOwned(identity, id);
    await this.prisma.travelPackage.update({ where: { id }, data: { archivedAt: new Date(), status: 'ARCHIVED' } });
    await this.prisma.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:'package.archived',resourceType:'TravelPackage',resourceId:id,requestId:identity.requestId}});
    return { deleted: true, id };
  }

  async createDeparture(identity:RequestIdentity,packageId:string,input:DepartureInput){
    const current = await this.assertOwned(identity,packageId);
    if(input.maxPax<input.minPax)throw new ConflictException('Kapasitas maksimal tidak boleh lebih kecil dari minimal pax');
    const startsAt=new Date(input.startsAt),endsAt=input.endsAt?new Date(input.endsAt):undefined,bookingCloseAt=input.bookingCloseAt?new Date(input.bookingCloseAt):undefined;
    if(endsAt&&endsAt<=startsAt)throw new ConflictException('Waktu selesai harus setelah waktu mulai');
    if(bookingCloseAt&&bookingCloseAt>=startsAt)throw new ConflictException('Penutupan booking harus sebelum keberangkatan');
    return this.prisma.$transaction(async tx=>{const departure=await tx.packageDeparture.create({data:{tenantId:identity.tenantId,packageId,startsAt,endsAt,bookingCloseAt,minPax:input.minPax,maxPax:input.maxPax,meetingPoint:input.meetingPoint,notes:input.notes,internalNotes:input.internalNotes??input.notes,publicNotes:input.publicNotes,status:input.status??'OPEN',surchargeLabel:input.surchargeLabel,surchargeAmount:input.surchargeAmount??0,surchargeBasis:input.surchargeBasis??'PER_PAX'}});if(current.approvalStatus==='APPROVED')await tx.travelPackage.update({where:{id:packageId},data:{status:'DRAFT',approvalStatus:'DRAFT',submittedById:null,submittedAt:null,reviewedById:null,reviewedAt:null,reviewNote:null}});await tx.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:'departure.created',resourceType:'PackageDeparture',resourceId:departure.id,requestId:identity.requestId,metadata:{packageId,surchargeAmount:input.surchargeAmount??0,surchargeBasis:input.surchargeBasis??'PER_PAX',approvalInvalidated:current.approvalStatus==='APPROVED'}}});return departure});
  }

  private async assertOwned(identity: RequestIdentity, id: string) {
    const row = await this.prisma.travelPackage.findFirst({ where: { id, tenantId: identity.tenantId, archivedAt: null }, select: { id: true, approvalStatus: true } });
    if (!row) throw new NotFoundException('Paket tidak ditemukan');
    return row;
  }
}
