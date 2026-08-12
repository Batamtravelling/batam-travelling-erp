import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DepartureStatus, PackageStatus, Prisma, SurchargeBasis } from '@prisma/client';
import { PrismaService } from '../core/prisma.service.js';
import { RequestIdentity } from '../core/request-context.js';

export type PackageInput = {
  packageCode: string;
  name: string;
  destination?: string;
  durationDays?: number;
  sellingPrice?: number;
  status?: PackageStatus;
};
export type DepartureInput = { startsAt:string; endsAt?:string; bookingCloseAt?:string; minPax:number; maxPax:number; meetingPoint?:string; notes?:string; status?:DepartureStatus; surchargeLabel?:string; surchargeAmount?:number; surchargeBasis?:SurchargeBasis };

@Injectable()
export class PackagesService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(identity: RequestIdentity) {
    return this.prisma.travelPackage.findMany({
      where: { tenantId: identity.tenantId, archivedAt: null },
      select: {
        id: true, packageCode: true, name: true, destination: true, durationDays: true,
        adultPrice: true, serviceLevel: true, status: true, minPax: true, maxPax: true,
        prices: { where: { active: true }, orderBy: { priority: 'desc' }, take: 1, select: { sellingPrice: true } },
        departures: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: 'asc' }, take: 12, select: { id:true,startsAt:true,endsAt:true,bookingCloseAt:true,minPax:true,maxPax:true,status:true,meetingPoint:true,surchargeLabel:true,surchargeAmount:true,surchargeBasis:true } },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });
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
    await this.assertOwned(identity, id);
    const { sellingPrice, ...packageData } = updates;
    return this.prisma.$transaction(async (tx) => {
      const travelPackage = await tx.travelPackage.update({
        where: { id },
        data: { ...packageData, adultPrice: sellingPrice } as Prisma.TravelPackageUpdateInput,
      });
      if (sellingPrice !== undefined) {
        await tx.packagePrice.updateMany({ where: { tenantId: identity.tenantId, packageId: id, active: true }, data: { active: false } });
        await tx.packagePrice.create({ data: { tenantId: identity.tenantId, packageId: id, type: 'STANDARD', sellingPrice } });
      }
      await tx.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:'package.updated',resourceType:'TravelPackage',resourceId:id,requestId:identity.requestId,metadata:{priceChanged:sellingPrice!==undefined}}});
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
    await this.assertOwned(identity,packageId);
    if(input.maxPax<input.minPax)throw new ConflictException('Kapasitas maksimal tidak boleh lebih kecil dari minimal pax');
    return this.prisma.$transaction(async tx=>{const departure=await tx.packageDeparture.create({data:{tenantId:identity.tenantId,packageId,startsAt:new Date(input.startsAt),endsAt:input.endsAt?new Date(input.endsAt):undefined,bookingCloseAt:input.bookingCloseAt?new Date(input.bookingCloseAt):undefined,minPax:input.minPax,maxPax:input.maxPax,meetingPoint:input.meetingPoint,notes:input.notes,status:input.status??'OPEN',surchargeLabel:input.surchargeLabel,surchargeAmount:input.surchargeAmount??0,surchargeBasis:input.surchargeBasis??'PER_PAX'}});await tx.auditLog.create({data:{tenantId:identity.tenantId,actorId:identity.userId,action:'departure.created',resourceType:'PackageDeparture',resourceId:departure.id,requestId:identity.requestId,metadata:{packageId,surchargeAmount:input.surchargeAmount??0,surchargeBasis:input.surchargeBasis??'PER_PAX'}}});return departure});
  }

  private async assertOwned(identity: RequestIdentity, id: string) {
    const row = await this.prisma.travelPackage.findFirst({ where: { id, tenantId: identity.tenantId, archivedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundException('Paket tidak ditemukan');
  }
}
