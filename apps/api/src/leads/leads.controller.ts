import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { CreateLeadDto, TransitionLeadDto, UpdateLeadDto } from './dto.js';
import { LeadsService } from './leads.service.js';

@ApiTags('leads') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('leads')
export class LeadsController {
  constructor(private readonly service: LeadsService) {}
  @Post() @Permissions('lead.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() dto: CreateLeadDto) { return this.service.create(identity, dto); }
  @Get() @Permissions('lead.read') list(@CurrentIdentity() identity: RequestIdentity) { return this.service.list(identity); }
  @Get(':id') @Permissions('lead.read') find(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.find(identity, id); }
  @Patch(':id') @Permissions('lead.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateLeadDto) { return this.service.update(identity, id, dto); }
  @Post(':id/transition') @Permissions('lead.update') transition(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: TransitionLeadDto) { return this.service.transition(identity, id, dto); }
}

