import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../core/prisma.service.js';
import { CurrentIdentity, IdentityGuard, RequestIdentity } from '../core/request-context.js';

@ApiTags('auth') @Controller('auth')
export class DevAuthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  @Get('me') @UseGuards(IdentityGuard) async me(@CurrentIdentity() identity: RequestIdentity) {
    const user=await this.prisma.user.findFirstOrThrow({where:{id:identity.userId,tenantId:identity.tenantId},include:{roles:{include:{role:true}}}});
    return {tenantId:identity.tenantId,userId:identity.userId,name:user.name,jobTitle:user.jobTitle,permissions:Array.from(identity.permissions),role:user.roles.map(x=>x.role.name).join(', ')||'Karyawan'};
  }
}
