import { Module } from '@nestjs/common';
import { PrismaService } from './core/prisma.service.js';
import { CustomersModule } from './customers/customers.module.js';
import { LeadsModule } from './leads/leads.module.js';

@Module({ imports: [CustomersModule, LeadsModule], providers: [PrismaService], exports: [PrismaService] })
export class AppModule {}

