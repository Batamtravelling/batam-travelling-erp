import { Module } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { AuditService } from '../core/audit.service.js';
import { BookingCodeService } from '../core/booking-code.service.js';
import { IdentityGuard, PermissionGuard } from '../core/request-context.js';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';
@Module({ controllers: [LeadsController], providers: [LeadsService, PrismaService, AuditService, BookingCodeService, IdentityGuard, PermissionGuard] }) export class LeadsModule {}

