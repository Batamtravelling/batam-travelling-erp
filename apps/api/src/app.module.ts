import { Module } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { DevAuthController } from './auth/dev-auth.controller.js';
import { LeadsModule } from './leads/leads.module.js';
import { PackagesController } from './packages/packages.controller.js';
import { PackagesService } from './packages/packages.service.js';
import { SalesController } from './sales/sales.controller.js';
import { PublicModule } from './public/public.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';

@Module({
  imports: [CustomersModule, LeadsModule, PublicModule, TransactionsModule],
  controllers: [PackagesController, DevAuthController, SalesController],
  providers: [PrismaService, PackagesService],
  exports: [PrismaService],
})
export class AppModule {}
