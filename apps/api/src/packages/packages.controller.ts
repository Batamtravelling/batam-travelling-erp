import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { PackagesService } from './packages.service.js';

@ApiTags('packages') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('packages')
export class PackagesController {
  private readonly service = new PackagesService();

  @Get() @Permissions('package.read') list() {
    return this.service.list();
  }

  @Post() @Permissions('package.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() body: Record<string, unknown>) {
    return this.service.create({
      packageCode: String(body.packageCode ?? 'PKG-NEW'),
      name: String(body.name ?? 'New Package'),
      destination: String(body.destination ?? 'Batam'),
      durationDays: Number(body.durationDays ?? 1),
      sellingPrice: Number(body.sellingPrice ?? 0),
      status: (body.status as 'DRAFT' | 'ACTIVE' | 'ARCHIVED') ?? 'DRAFT',
    });
  }

  @Patch(':id') @Permissions('package.update') update(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.update(id, {
      ...body,
    });
  }

  @Delete(':id') @Permissions('package.update') remove(@Param('id') id: string) { return this.service.remove(id); }
}
