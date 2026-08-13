import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { assertPrivilegedOperatorRemains, assertSafeEmployeeSelfChange } from './employee-access-policy.js';

describe('employee access policy', () => {
  it('blocks self deactivation', () => {
    expect(() => assertSafeEmployeeSelfChange({
      actorUserId: 'u1', targetUserId: 'u1', currentActive: true, nextActive: false,
      currentRoleIds: ['staff'],
    })).toThrow(BadRequestException);
  });

  it('blocks changing own roles', () => {
    expect(() => assertSafeEmployeeSelfChange({
      actorUserId: 'u1', targetUserId: 'u1', currentActive: true,
      currentRoleIds: ['staff'], nextRoleIds: ['admin'],
    })).toThrow(BadRequestException);
  });

  it('allows own profile update when authority is unchanged', () => {
    expect(() => assertSafeEmployeeSelfChange({
      actorUserId: 'u1', targetUserId: 'u1', currentActive: true,
      currentRoleIds: ['staff'], nextRoleIds: ['staff'],
    })).not.toThrow();
  });

  it('allows an administrator to manage another employee', () => {
    expect(() => assertSafeEmployeeSelfChange({
      actorUserId: 'admin', targetUserId: 'u1', currentActive: true, nextActive: false,
      currentRoleIds: ['staff'], nextRoleIds: [],
    })).not.toThrow();
  });

  it('protects the last privileged operator', () => {
    expect(() => assertPrivilegedOperatorRemains({
      targetIsPrivileged: true,
      targetWillRemainPrivileged: false,
      otherActivePrivilegedUsers: 0,
    })).toThrow(BadRequestException);
  });

  it('allows privilege removal when another privileged operator remains', () => {
    expect(() => assertPrivilegedOperatorRemains({
      targetIsPrivileged: true,
      targetWillRemainPrivileged: false,
      otherActivePrivilegedUsers: 1,
    })).not.toThrow();
  });
});
