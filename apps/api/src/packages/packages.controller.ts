import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { PackagesService } from './packages.service.js';
import { CreatePackageDto, DepartureDto, PackageQueryDto, UpdatePackageDto } from './dto.js';

@ApiTags('packages') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('packages')
export class PackagesController {
  constructor(@Inject(PackagesService) private readonly service: PackagesService) {}

  @Get() @Permissions('package.read') list(@CurrentIdentity() identity: RequestIdentity,@Query()query:PackageQueryDto) {
    return this.service.list(identity,query);
  }

  @Post() @Permissions('package.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() body: CreatePackageDto) {
    return this.service.create(identity, { ...body, packageCode: body.packageCode.trim(), name: body.name.trim() });
  }

  @Patch(':id') @Permissions('package.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() body: UpdatePackageDto) {
    return this.service.update(identity, id, body);
  }

  @Delete(':id') @Permissions('package.update') remove(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    return this.service.remove(identity, id);
  }
  @Post(':id/departures') @Permissions('package.update') createDeparture(@CurrentIdentity()identity:RequestIdentity,@Param('id')id:string,@Body()body:DepartureDto){return this.service.createDeparture(identity,id,body)}
}
