import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service.js';
import { RequestIdentity } from './request-context.js';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}
  async record(identity: RequestIdentity, action: string, resourceType: string, resourceId: string, metadata?: Prisma.InputJsonValue) {
    return this.prisma.auditLog.create({ data: { tenantId: identity.tenantId, actorId: identity.userId, action, resourceType, resourceId, requestId: identity.requestId, metadata } });
  }
}

