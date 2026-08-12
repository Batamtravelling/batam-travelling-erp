import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PackageStatus, Prisma } from '@prisma/client';
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
      return travelPackage;
    });
  }

  async remove(identity: RequestIdentity, id: string) {
    await this.assertOwned(identity, id);
    await this.prisma.travelPackage.update({ where: { id }, data: { archivedAt: new Date(), status: 'ARCHIVED' } });
    return { deleted: true, id };
  }

  private async assertOwned(identity: RequestIdentity, id: string) {
    const row = await this.prisma.travelPackage.findFirst({ where: { id, tenantId: identity.tenantId, archivedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundException('Paket tidak ditemukan');
  }
}
