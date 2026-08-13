import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';
import { PrismaService } from './prisma.service.js';
import { IdentityGuard, PermissionGuard } from './request-context.js';

describe('request context dependency injection', () => {
  it('injects PrismaService and resolves a development identity', async () => {
    const user = {
      id: 'user-a', tenantId: 'tenant-a',
      roles: [{ role: { permissions: [{ permission: { code: 'customer.read' } }] } }],
    };
    const prisma = { user: { findFirst: vi.fn().mockResolvedValue(user) } };
    const module = await Test.createTestingModule({
      providers: [
        IdentityGuard,
        PermissionGuard,
        Reflector,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    const request: any = { headers: { 'x-dev-user-id': user.id, 'x-tenant-id': user.tenantId } };
    const context = { switchToHttp: () => ({ getRequest: () => request }) } as ExecutionContext;

    await expect(module.get(IdentityGuard).canActivate(context)).resolves.toBe(true);
    expect(request.identity).toMatchObject({ tenantId: 'tenant-a', userId: 'user-a' });
    expect(request.identity.permissions.has('customer.read')).toBe(true);
  });

  it('returns unauthorized instead of a server error when identity headers are absent', async () => {
    const module = await Test.createTestingModule({
      providers: [IdentityGuard, { provide: PrismaService, useValue: { user: { findFirst: vi.fn() } } }],
    }).compile();
    const context = { switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as ExecutionContext;
    await expect(module.get(IdentityGuard).canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
