import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { BookingCodeService } from '../core/booking-code.service.js';
import { PrismaService } from '../core/prisma.service.js';
import { CustomerAuthController } from './customer-auth.controller.js';
import { CustomerAuthService } from './customer-auth.service.js';

describe('CustomerAuthModule dependency injection', () => {
  it('injects the service into the controller without emitted constructor metadata', async () => {
    process.env.NODE_ENV = 'test';
    process.env.CUSTOMER_AUTH_PROVIDER = 'local';
    const module = await Test.createTestingModule({
      controllers: [CustomerAuthController],
      providers: [
        CustomerAuthService,
        { provide: PrismaService, useValue: { tenant: { findUnique: vi.fn() } } },
        { provide: BookingCodeService, useValue: { nextCustomer: vi.fn() } },
      ],
    }).compile();
    expect(module.get(CustomerAuthController)).toBeDefined();
    expect(module.get(CustomerAuthService)).toBeDefined();
  });
});
