import { Module } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service.js';
import { AuditService } from '../core/audit.service.js';
import { IdentityGuard, PermissionGuard } from '../core/request-context.js';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
@Module({ controllers: [CustomersController], providers: [CustomersService, PrismaService, AuditService, IdentityGuard, PermissionGuard] }) export class CustomersModule {}

