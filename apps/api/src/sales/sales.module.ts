import { Module } from '@nestjs/common';
import { BookingCodeService } from '../core/booking-code.service.js';
import { DepartureCapacityService } from '../core/departure-capacity.service.js';
import { PrismaService } from '../core/prisma.service.js';
import { IdentityGuard, PermissionGuard } from '../core/request-context.js';
import { SalesController } from './sales.controller.js';
import { SalesService } from './sales.service.js';

@Module({
  controllers: [SalesController],
  providers: [SalesService, PrismaService, BookingCodeService, DepartureCapacityService, IdentityGuard, PermissionGuard],
})
export class SalesModule {}
