import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto.js';
import { CustomersService } from './customers.service.js';

@ApiTags('customers') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('customers')
export class CustomersController {
  constructor(@Inject(CustomersService) private readonly service: CustomersService) {}
  @Post() @Permissions('customer.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() dto: CreateCustomerDto) { return this.service.create(identity, dto); }
  @Get() @Permissions('customer.read') list(@CurrentIdentity() identity: RequestIdentity, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('search') search?: string) { return this.service.list(identity, { page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined, search }); }
  @Get(':id') @Permissions('customer.read') find(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.find(identity, id); }
  @Patch(':id') @Permissions('customer.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateCustomerDto) { return this.service.update(identity, id, dto); }
  @Delete(':id') @Permissions('customer.update') remove(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.remove(identity, id); }
}
