import { Module } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { DevAuthController } from './auth/dev-auth.controller.js';
import { LeadsModule } from './leads/leads.module.js';
import { PackagesController } from './packages/packages.controller.js';
import { SalesController } from './sales/sales.controller.js';

@Module({ imports: [CustomersModule, LeadsModule], controllers: [PackagesController, DevAuthController, SalesController], providers: [PrismaService], exports: [PrismaService] })
export class AppModule {}

