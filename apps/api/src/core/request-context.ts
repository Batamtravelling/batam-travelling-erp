import { CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from './prisma.service.js';

export type RequestIdentity = { tenantId: string; userId: string; permissions: Set<string>; requestId?: string };
export const CurrentIdentity = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestIdentity => ctx.switchToHttp().getRequest().identity);
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

type SupabaseUser = { id?: string; email?: string; email_confirmed_at?: string | null };

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  private async authenticateSupabase(authorization: string) {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
    const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !publishableKey) throw new UnauthorizedException('Supabase Auth belum dikonfigurasi');

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { authorization, apikey: publishableKey },
      signal: AbortSignal.timeout(5000),
    }).catch(() => null);
    if (!response?.ok) throw new UnauthorizedException('Sesi tidak valid atau sudah berakhir');

    const authUser = await response.json() as SupabaseUser;
    if (!authUser.id || !authUser.email || !authUser.email_confirmed_at) {
      throw new UnauthorizedException('Akun Supabase belum memiliki email terverifikasi');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        active: true,
        OR: [
          { cognitoId: authUser.id },
          { email: { equals: authUser.email, mode: 'insensitive' } },
        ],
      },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) throw new UnauthorizedException('Akun belum terdaftar sebagai karyawan ERP');

    if (!user.cognitoId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { cognitoId: authUser.id },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });
    } else if (user.cognitoId !== authUser.id) {
      throw new UnauthorizedException('Email ERP sudah terhubung ke akun autentikasi lain');
    }
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    let user;

    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      user = await this.authenticateSupabase(authorization);
    } else {
      if (process.env.NODE_ENV === 'production') throw new UnauthorizedException('Bearer token diperlukan');
      const userId = request.headers['x-dev-user-id'];
      const tenantId = request.headers['x-tenant-id'];
      if (typeof userId !== 'string' || typeof tenantId !== 'string') throw new UnauthorizedException('Development identity headers are required');
      user = await this.prisma.user.findFirst({
        where: { id: userId, tenantId, active: true },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });
      if (!user) throw new UnauthorizedException('Unknown or inactive user');
    }

    request.identity = {
      tenantId: user.tenantId,
      userId: user.id,
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
    if (!required.every((permission) => identity.permissions.has(permission))) throw new ForbiddenException('Permission denied');
    return true;
  }
}
