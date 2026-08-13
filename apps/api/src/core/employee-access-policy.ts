import { BadRequestException } from '@nestjs/common';

export type EmployeeAccessChange = {
  actorUserId: string;
  targetUserId: string;
  currentActive: boolean;
  nextActive?: boolean;
  currentRoleIds: string[];
  nextRoleIds?: string[];
};

/**
 * Security invariant: a user may edit their own profile, but may not change
 * their own authority or deactivate their own account.
 *
 * This is deliberately kept independent from Prisma so every employee write
 * path (HTTP, jobs, future admin tooling) can reuse the same rule.
 */
export function assertSafeEmployeeSelfChange(change: EmployeeAccessChange): void {
  if (change.actorUserId !== change.targetUserId) return;

  if (change.nextActive === false && change.currentActive) {
    throw new BadRequestException('Karyawan tidak dapat menonaktifkan akun sendiri');
  }

  if (change.nextRoleIds !== undefined) {
    const before = normalized(change.currentRoleIds);
    const after = normalized(change.nextRoleIds);
    if (before.length !== after.length || before.some((roleId, index) => roleId !== after[index])) {
      throw new BadRequestException('Karyawan tidak dapat mengubah role atau kewenangan sendiri');
    }
  }
}

/** Prevent a tenant from losing its final active privileged operator. */
export function assertPrivilegedOperatorRemains(input: {
  targetIsPrivileged: boolean;
  targetWillRemainPrivileged: boolean;
  otherActivePrivilegedUsers: number;
}): void {
  if (
    input.targetIsPrivileged &&
    !input.targetWillRemainPrivileged &&
    input.otherActivePrivilegedUsers < 1
  ) {
    throw new BadRequestException('Tenant harus memiliki setidaknya satu Owner/Admin aktif');
  }
}

function normalized(roleIds: string[]): string[] {
  return [...new Set(roleIds)].sort();
}
