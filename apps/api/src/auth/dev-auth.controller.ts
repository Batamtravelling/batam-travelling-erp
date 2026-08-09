import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentIdentity, IdentityGuard, RequestIdentity } from '../core/request-context.js';

@ApiTags('auth') @Controller('auth')
export class DevAuthController {
  @Get('me') @UseGuards(IdentityGuard) me(@CurrentIdentity() identity: RequestIdentity) {
    return {
      tenantId: identity.tenantId,
      userId: identity.userId,
      permissions: Array.from(identity.permissions),
      role: 'Tenant Owner',
    };
  }
}
