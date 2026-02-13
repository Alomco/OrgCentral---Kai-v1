import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfileDTO } from '@/server/types/hr/people';
import { updateEmployeeProfile } from '@/server/use-cases/hr/people/update-employee-profile';

const { assertPeopleProfileEditorMock, invalidateProfilesAfterMutationMock } = vi.hoisted(() => ({
  assertPeopleProfileEditorMock: vi.fn(
    async (request: { authorization: { userId: string }; resourceAttributes?: Record<string, unknown> }) => {
      const resourceUserId =
        typeof request.resourceAttributes?.userId === 'string'
          ? request.resourceAttributes.userId
          : undefined;
      if (!resourceUserId || resourceUserId !== request.authorization.userId) {
        throw new Error('ABAC policy denied this action.');
      }
      return request.authorization;
    },
  ),
  invalidateProfilesAfterMutationMock: vi.fn(async () => undefined),
}));

vi.mock('@/server/security/guards-hr-people', () => ({
  assertPeopleProfileEditor: assertPeopleProfileEditorMock,
}));

vi.mock('@/server/use-cases/hr/people/shared/cache-helpers', () => ({
  invalidateProfilesAfterMutation: invalidateProfilesAfterMutationMock,
}));

function createAuthorization(userId: string): RepositoryAuthorizationContext {
  return {
    orgId: 'org-1',
    userId,
    roleKey: 'member',
    roleName: 'member',
    permissions: {
      'hr.people.profile': ['update'],
    },
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test:update-employee-profile',
    correlationId: 'corr-1',
    tenantScope: {
      orgId: 'org-1',
      dataResidency: 'UK_ONLY',
      dataClassification: 'OFFICIAL',
      auditSource: 'test:update-employee-profile',
    },
  };
}

function buildProfile(userId: string): EmployeeProfileDTO {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: 'profile-1',
    orgId: 'org-1',
    userId,
    employeeNumber: 'EMP-1',
    employmentStatus: 'ACTIVE',
    employmentType: 'FULL_TIME',
    healthStatus: 'UNDEFINED',
    createdAt: now,
    updatedAt: now,
  };
}

function createRepository(existingProfile: EmployeeProfileDTO | null): {
  repository: IEmployeeProfileRepository;
  updateEmployeeProfileMock: ReturnType<typeof vi.fn>;
} {
  const getEmployeeProfileMock = vi.fn(async () => existingProfile);
  const updateEmployeeProfileMock = vi.fn(async () => undefined);

  const repository: IEmployeeProfileRepository = {
    createEmployeeProfile: vi.fn(async () => undefined),
    updateEmployeeProfile: updateEmployeeProfileMock,
    getEmployeeProfile: getEmployeeProfileMock,
    getEmployeeProfileByUser: vi.fn(async () => null),
    getEmployeeProfilesByOrganization: vi.fn(async () => []),
    getEmployeeProfilesByOrganizationPaged: vi.fn(async () => []),
    countEmployeeProfilesByOrganization: vi.fn(async () => 0),
    findByEmployeeNumber: vi.fn(async () => null),
    findByEmail: vi.fn(async () => null),
    linkProfileToUser: vi.fn(async () => undefined),
    updateComplianceStatus: vi.fn(async () => undefined),
    deleteEmployeeProfile: vi.fn(async () => undefined),
  };

  return { repository, updateEmployeeProfileMock };
}

describe('updateEmployeeProfile ownership scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows self-profile updates when the authenticated user owns the profile', async () => {
    const authorization = createAuthorization('user-1');
    const { repository, updateEmployeeProfileMock } = createRepository(buildProfile('user-1'));

    await expect(
      updateEmployeeProfile(
        { employeeProfileRepository: repository },
        {
          authorization,
          profileId: 'profile-1',
          profileUpdates: { jobTitle: 'Staff Engineer' },
        },
      ),
    ).resolves.toEqual({ success: true });

    expect(assertPeopleProfileEditorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        authorization,
        resourceAttributes: expect.objectContaining({ userId: 'user-1' }),
      }),
    );
    expect(updateEmployeeProfileMock).toHaveBeenCalledWith('org-1', 'profile-1', {
      jobTitle: 'Staff Engineer',
    });
    expect(invalidateProfilesAfterMutationMock).toHaveBeenCalledWith(authorization);
  });

  it('rejects updates when the authenticated user does not own the target profile', async () => {
    const authorization = createAuthorization('user-1');
    const { repository, updateEmployeeProfileMock } = createRepository(buildProfile('user-2'));

    await expect(
      updateEmployeeProfile(
        { employeeProfileRepository: repository },
        {
          authorization,
          profileId: 'profile-1',
          profileUpdates: { jobTitle: 'Principal Engineer' },
        },
      ),
    ).rejects.toThrow('ABAC policy denied this action.');

    expect(updateEmployeeProfileMock).not.toHaveBeenCalled();
    expect(invalidateProfilesAfterMutationMock).not.toHaveBeenCalled();
  });
});

