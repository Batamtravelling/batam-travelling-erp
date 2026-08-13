import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from './prisma.service.js';
import { RequestIdentity } from './request-context.js';
import { assertPrivilegedOperatorRemains, assertSafeEmployeeSelfChange } from './employee-access-policy.js';

type EmployeeMutationBody = {
  active?: boolean;
  roleIds?: string[];
};

/**
 * Enforces Employee/IAM invariants immediately before the employee mutation
 * handler executes. IdentityGuard and PermissionGuard have already resolved
 * the authenticated tenant/user when interceptors run.
 */
@Injectable()
export class EmployeeAccessInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'PATCH' || !this.isEmployeeMutation(request.path ?? request.url)) return next.handle();

    const identity = request.identity as RequestIdentity | undefined;
    if (!identity) return next.handle();

    const targetId = String(request.params?.id ?? '');
    const body = (request.body ?? {}) as EmployeeMutationBody;
    if (!targetId || (body.active === undefined && body.roleIds === undefined)) return next.handle();

    const current = await this.prisma.user.findFirst({
      where: { id: targetId, tenantId: identity.tenantId },
      select: {
        id: true,
        active: true,
        roles: {
          select: {
            roleId: true,
            role: {
              select: {
                name: true,
                permissions: { select: { permission: { select: { code: true } } } },
              },
            },
          },
        },
      },
    });
    if (!current) throw new NotFoundException('Karyawan tidak ditemukan');

    const currentRoleIds = current.roles.map((item) => item.roleId);
    const nextRoleIds = body.roleIds === undefined ? undefined : [...new Set(body.roleIds)];

    assertSafeEmployeeSelfChange({
      actorUserId: identity.userId,
      targetUserId: current.id,
      currentActive: current.active,
      nextActive: body.active,
      currentRoleIds,
      nextRoleIds,
    });

    const currentIsPrivileged = current.roles.some((item) => this.isPrivilegedRole(item.role));
    if (!currentIsPrivileged) return next.handle();

    const nextActive = body.active ?? current.active;
    let nextIsPrivileged = currentIsPrivileged;
    if (nextRoleIds !== undefined) {
      const roles = nextRoleIds.length
        ? await this.prisma.role.findMany({
            where: { id: { in: nextRoleIds }, OR: [{ tenantId: identity.tenantId }, { tenantId: null }] },
            select: {
              id: true,
              name: true,
              permissions: { select: { permission: { select: { code: true } } } },
            },
          })
        : [];
      if (roles.length !== nextRoleIds.length) throw new BadRequestException('Role tidak valid');
      nextIsPrivileged = roles.some((role) => this.isPrivilegedRole(role));
    }

    const targetWillRemainPrivileged = nextActive && nextIsPrivileged;
    if (!targetWillRemainPrivileged) {
      const otherActivePrivilegedUsers = await this.countOtherActivePrivilegedUsers(identity.tenantId, targetId);
      assertPrivilegedOperatorRemains({
        targetIsPrivileged: true,
        targetWillRemainPrivileged,
        otherActivePrivilegedUsers,
      });
    }

    return next.handle();
  }

  private isEmployeeMutation(path: string): boolean {
    return /^\/employees\/[^/?]+(?:\?.*)?$/.test(path);
  }

  private isPrivilegedRole(role: { name: string; permissions: Array<{ permission: { code: string } }> }): boolean {
    const name = role.name.toLowerCase();
    return name.includes('owner') || name.includes('admin') || role.permissions.some((item) => item.permission.code === 'dashboard.owner');
  }

  private async countOtherActivePrivilegedUsers(tenantId: string, targetId: string): Promise<number> {
    const users = await this.prisma.user.findMany({
      where: { tenantId, active: true, id: { not: targetId } },
      select: {
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: { select: { permission: { select: { code: true } } } },
              },
            },
          },
        },
      },
    });
    return users.filter((user) => user.roles.some((item) => this.isPrivilegedRole(item.role))).length;
  }
}
