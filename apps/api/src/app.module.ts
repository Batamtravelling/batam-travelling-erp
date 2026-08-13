import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaService } from './core/prisma.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { DevAuthController } from './auth/dev-auth.controller.js';
import { LeadsModule } from './leads/leads.module.js';
import { PackagesController } from './packages/packages.controller.js';
import { PackagesService } from './packages/packages.service.js';
import { SalesModule } from './sales/sales.module.js';
import { PublicModule } from './public/public.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { RefundsModule } from './refunds/refunds.module.js';
import { ConnectedModulesModule } from './connected-modules.module.js';
import { AdminWorkspaceModule } from './admin-workspace.module.js';
import { HealthController } from './health.controller.js';
import { HousekeepingService } from './core/housekeeping.service.js';
import { EmployeeAccessInterceptor } from './core/employee-access.interceptor.js';
import { CustomerAuthModule } from './customer-auth/customer-auth.module.js';

@Module({
  imports: [CustomersModule, LeadsModule, SalesModule, PublicModule, CustomerAuthModule, TransactionsModule, RefundsModule, ConnectedModulesModule, AdminWorkspaceModule],
  controllers: [PackagesController, DevAuthController, HealthController],
  providers: [
    PrismaService,
    PackagesService,
    HousekeepingService,
    EmployeeAccessInterceptor,
    { provide: APP_INTERCEPTOR, useExisting: EmployeeAccessInterceptor },
  ],
  exports: [PrismaService],
})
export class AppModule {}
