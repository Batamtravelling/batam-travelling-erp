import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { CreateFollowUpDto, CreateLeadDto, FollowUpQueryDto, TransitionLeadDto, UpdateFollowUpDto, UpdateLeadDto, VerifyLeadDto } from './dto.js';
import { LeadsService } from './leads.service.js';

@ApiTags('leads') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('leads')
export class LeadsController {
  constructor(@Inject(LeadsService) private readonly service: LeadsService) {}
  @Post() @Permissions('lead.create') create(@CurrentIdentity() identity: RequestIdentity, @Body() dto: CreateLeadDto) { return this.service.create(identity, dto); }
  @Get() @Permissions('lead.read') list(@CurrentIdentity() identity: RequestIdentity, @Query('page') page?: string, @Query('pageSize') pageSize?: string, @Query('search') search?: string, @Query('source') source?: string, @Query('status') status?: string) { return this.service.list(identity, { page: page ? Number(page) : undefined, pageSize: pageSize ? Number(pageSize) : undefined, search, source, status }); }
  @Get('follow-ups') @Permissions('lead.read') followUps(@CurrentIdentity() identity: RequestIdentity, @Query() query: FollowUpQueryDto) { return this.service.listFollowUps(identity, query); }
  @Get(':id') @Permissions('lead.read') find(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.find(identity, id); }
  @Patch(':id') @Permissions('lead.update') update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateLeadDto) { return this.service.update(identity, id, dto); }
  @Delete(':id') @Permissions('lead.update') remove(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) { return this.service.remove(identity, id); }
  @Post(':id/transition') @Permissions('lead.update') transition(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: TransitionLeadDto) { return this.service.transition(identity, id, dto); }
  @Post(':id/verify') @Permissions('lead.convert') verify(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: VerifyLeadDto) { return this.service.verify(identity,id,dto); }
  @Post(':id/follow-ups') @Permissions('lead.update') followUp(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: CreateFollowUpDto) { return this.service.addFollowUp(identity,id,dto); }
  @Patch('follow-ups/:id') @Permissions('lead.update') updateFollowUp(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateFollowUpDto) { return this.service.updateFollowUp(identity,id,dto); }
}

