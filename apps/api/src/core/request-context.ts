import { CanActivate, createParamDecorator, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { PrismaService } from './prisma.service.js';

export type RequestIdentity = { tenantId: string; userId: string; permissions: Set<string>; requestId?: string };
export const CurrentIdentity = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestIdentity => ctx.switchToHttp().getRequest().identity);
export const Permissions = (...permissions: string[]) => SetMetadata('permissions', permissions);

type SupabaseClaims = JWTPayload & { email?: string; role?: string; session_id?: string; is_anonymous?: boolean };
const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  private async authenticateSupabase(authorization: string) {
    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
    if (!supabaseUrl) throw new UnauthorizedException('Supabase Auth belum dikonfigurasi');
    const token = authorization.slice('Bearer '.length).trim();
    const issuer = `${supabaseUrl}/auth/v1`;
    let jwks = jwksByUrl.get(supabaseUrl);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`), { cooldownDuration: 300_000, cacheMaxAge: 600_000 });
      jwksByUrl.set(supabaseUrl, jwks);
    }
    let authUser: SupabaseClaims;
    try {
      const verified = await jwtVerify(token, jwks, { issuer, audience: 'authenticated', clockTolerance: 5 });
      authUser = verified.payload as SupabaseClaims;
    } catch {
      throw new UnauthorizedException('Sesi tidak valid atau sudah berakhir');
    }
    if (!authUser.sub || !authUser.email || authUser.role !== 'authenticated' || authUser.is_anonymous || !authUser.session_id) throw new UnauthorizedException('Akun Supabase tidak valid');

    let user = await this.prisma.user.findFirst({
      where: {
        active: true,
        OR: [
          { cognitoId: authUser.sub },
          { email: { equals: authUser.email, mode: 'insensitive' } },
        ],
      },
      include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
    });
    if (!user) throw new UnauthorizedException('Akun belum terdaftar sebagai karyawan ERP');

    if (!user.cognitoId) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { cognitoId: authUser.sub },
        include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } },
      });
    } else if (user.cognitoId !== authUser.sub) {
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
