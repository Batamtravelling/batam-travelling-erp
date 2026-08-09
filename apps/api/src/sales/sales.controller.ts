import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IdentityGuard, PermissionGuard } from '../core/request-context.js';
import { SalesService } from './sales.service.js';

@ApiTags('sales') @ApiBearerAuth() @UseGuards(IdentityGuard, PermissionGuard) @Controller('sales')
export class SalesController {
  private readonly service = new SalesService();

  @Get('quotations') quotations() {
    return this.service.getQuotations();
  }

  @Get('bookings') bookings() {
    return this.service.getBookings();
  }
}
