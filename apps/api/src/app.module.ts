import { Module } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { DevAuthController } from './auth/dev-auth.controller.js';
import { LeadsModule } from './leads/leads.module.js';
import { PackagesController } from './packages/packages.controller.js';
import { PackagesService } from './packages/packages.service.js';
import { SalesModule } from './sales/sales.module.js';
import { PublicModule } from './public/public.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { ConnectedModulesModule } from './connected-modules.module.js';
import { AdminWorkspaceModule } from './admin-workspace.module.js';
import { HealthController } from './health.controller.js';
import { HousekeepingService } from './core/housekeeping.service.js';

@Module({
  imports: [CustomersModule, LeadsModule, SalesModule, PublicModule, TransactionsModule, ConnectedModulesModule, AdminWorkspaceModule],
  controllers: [PackagesController, DevAuthController, HealthController],
  providers: [PrismaService, PackagesService, HousekeepingService],
  exports: [PrismaService],
})
export class AppModule {}
