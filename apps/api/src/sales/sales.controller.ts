import { Body, Controller, Get, Inject, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, PermissionGuard, Permissions, RequestIdentity } from '../core/request-context.js';
import { AcceptQuotationDto, ConvertQuotationDto, CreateQuotationDto, QuotationQueryDto, RejectQuotationDto, UpdateQuotationDto } from './dto.js';
import { SalesService } from './sales.service.js';

@ApiTags('quotations')
@ApiBearerAuth()
@UseGuards(IdentityGuard, PermissionGuard)
@Controller(['quotations', 'sales/quotations'])
export class SalesController {
  constructor(@Inject(SalesService) private readonly service: SalesService) {}

  @Get()
  @Permissions('quotation.view')
  list(
    @CurrentIdentity() identity: RequestIdentity,
    @Query() query: QuotationQueryDto,
  ) {
    return this.service.list(identity, query);
  }

  @Post()
  @Permissions('quotation.create')
  create(@CurrentIdentity() identity: RequestIdentity, @Body() dto: CreateQuotationDto) {
    return this.service.create(identity, dto);
  }

  @Get(':id')
  @Permissions('quotation.view')
  find(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    return this.service.find(identity, id);
  }

  @Patch(':id')
  @Permissions('quotation.edit')
  update(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: UpdateQuotationDto) {
    return this.service.update(identity, id, dto);
  }

  @Post(':id/send')
  @Permissions('quotation.send')
  send(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    return this.service.send(identity, id);
  }

  @Post(':id/accept')
  @Permissions('quotation.accept')
  accept(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: AcceptQuotationDto) {
    return this.service.accept(identity, id, dto);
  }

  @Post(':id/reject')
  @Permissions('quotation.accept')
  reject(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: RejectQuotationDto) {
    return this.service.reject(identity, id, dto);
  }

  @Post(':id/duplicate')
  @Permissions('quotation.create')
  duplicate(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string) {
    return this.service.duplicate(identity, id);
  }

  @Post(':id/convert')
  @Permissions('quotation.accept', 'booking.manage')
  convert(@CurrentIdentity() identity: RequestIdentity, @Param('id') id: string, @Body() dto: ConvertQuotationDto) {
    return this.service.convert(identity, id, dto);
  }
}
