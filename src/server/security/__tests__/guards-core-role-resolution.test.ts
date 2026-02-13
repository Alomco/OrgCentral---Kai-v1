import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GuardMembershipRecord } from '@/server/repositories/contracts/security/guard-membership-repository-contract';

const {
  findMembershipMock,
  resolveMembershipPermissionsMock,
  resolveDevelopmentAdminMembershipOverrideMock,
} = vi.hoisted(() => ({
  findMembershipMock: vi.fn(),
  resolveMembershipPermissionsMock: vi.fn(),
  resolveDevelopmentAdminMembershipOverrideMock: vi.fn(),
}));

vi.mock('@/server/security/guards/membership-repository', () => ({
  getGuardMembershipRepository: () => ({
    findMembership: findMembershipMock,
  }),
}));

vi.mock('@/server/services/security/permission-resolution-service.provider', () => ({
  getPermissionResolutionService: () => ({
    resolveMembershipPermissions: resolveMembershipPermissionsMock,
  }),
}));

vi.mock('@/server/security/guards/development-admin-override', () => ({
  resolveDevelopmentAdminMembershipOverride: resolveDevelopmentAdminMembershipOverrideMock,
}));

import { assertOrgAccess } from '@/server/security/guards/core';

function buildMembership(roleName: string): GuardMembershipRecord {
  return {
    orgId: 'org-1',
    userId: 'user-1',
    status: 'ACTIVE',
    roleName,
    organization: {
      id: 'org-1',
      dataResidency: 'UK_ONLY',
      dataClassification: 'OFFICIAL',
    },
  };
}

describe('assertOrgAccess role resolution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveDevelopmentAdminMembershipOverrideMock.mockResolvedValue(null);
    resolveMembershipPermissionsMock.mockResolvedValue({});
  });

  it('keeps custom role names custom for ABAC role resolution', async () => {
    findMembershipMock.mockResolvedValue(buildMembership('orgAdminSupport'));

    const context = await assertOrgAccess({
      orgId: 'org-1',
      userId: 'user-1',
    });

    expect(context.roleName).toBe('orgAdminSupport');
    expect(context.roleKey).toBe('custom');
  });
});
