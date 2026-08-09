import { BadRequestException, CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service.js';

export type RequestIdentity = { tenantId: string; userId: string; permissions: Set<string>; requestId?: string };
export const CurrentIdentity = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestIdentity => ctx.switchToHttp().getRequest().identity);
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (process.env.NODE_ENV === 'production') throw new UnauthorizedException('Cognito JWT validation must be configured in production');
    const userId = request.headers['x-dev-user-id'];
    const tenantId = request.headers['x-tenant-id'];
    if (typeof userId !== 'string' || typeof tenantId !== 'string') throw new UnauthorizedException('Development identity headers are required');
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, active: true },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) throw new UnauthorizedException('Unknown or inactive user');
    request.identity = {
      tenantId, userId,
      permissions: new Set(user.roles.flatMap((item) => item.role.permissions.map((rp) => rp.permission.code))),
      requestId: typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : undefined,
    } satisfies RequestIdentity;
    return true;
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('permissions', [context.getHandler(), context.getClass()]) ?? [];
    if (required.length === 0) return true;
    const identity: RequestIdentity = context.switchToHttp().getRequest().identity;
    if (!required.every((permission) => identity.permissions.has(permission))) throw new BadRequestException('Permission denied');
    return true;
  }
}
