import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { CreateCustomerDto, UpdateCustomerDto } from './dto.js';
import { CustomersService } from './customers.service.js';

@ApiTags('customers') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}
  @Post() @Permissions('customer.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() dto: CreateCustomerDto) { return this.service.create(identity, dto); }
  @Get() @Permissions('customer.read') list(@CurrentIdentity() identity: RequestIdentity) { return this.service.list(identity); }
  @Get(':id') @Permissions('customer.read') find(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.find(identity, id); }
  @Patch(':id') @Permissions('customer.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateCustomerDto) { return this.service.update(identity, id, dto); }
}
