import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ValidationError } from '@/server/errors';
import { CACHE_SCOPE_ABAC_POLICIES } from '@/server/repositories/cache-scopes';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbacPolicy } from '@/server/security/abac-types';
import type { PermissionResource } from '@/server/types/security-types';
import { setAbacPolicies } from '@/server/use-cases/org/abac/set-abac-policies';

const { invalidateOrgCacheMock, recordAuditEventMock } = vi.hoisted(() => ({
  invalidateOrgCacheMock: vi.fn(async () => undefined),
  recordAuditEventMock: vi.fn(async () => undefined),
}));

vi.mock('@/server/lib/cache-tags', () => ({
  invalidateOrgCache: invalidateOrgCacheMock,
}));

vi.mock('@/server/logging/audit-logger', () => ({
  recordAuditEvent: recordAuditEventMock,
}));

class InMemoryAbacPolicyRepository implements IAbacPolicyRepository {
  private readonly policiesByOrg = new Map<string, AbacPolicy[]>();

  async getPoliciesForOrg(orgId: string): Promise<AbacPolicy[]> {
    return this.policiesByOrg.get(orgId) ?? [];
  }

  async setPoliciesForOrg(orgId: string, policies: AbacPolicy[]): Promise<void> {
    this.policiesByOrg.set(orgId, policies);
  }
}

function createAuthorization(): RepositoryAuthorizationContext {
  return {
    orgId: 'org-1',
    userId: 'admin-1',
    roleKey: 'orgAdmin',
    roleName: 'orgAdmin',
    permissions: { 'org.abac.policy': ['update'] },
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'test:org:abac',
    correlationId: 'corr-abac-1',
    tenantScope: {
      orgId: 'org-1',
      dataResidency: 'UK_ONLY',
      dataClassification: 'OFFICIAL',
      auditSource: 'test:org:abac',
    },
  };
}

function createCustomPermissionResource(resource: string, action: string): PermissionResource {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: `resource-${resource}`,
    orgId: 'org-1',
    resource,
    actions: [action],
    createdAt: now,
    updatedAt: now,
  };
}

describe('setAbacPolicies integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unknown selectors and does not persist policy changes', async () => {
    const policyRepository = new InMemoryAbacPolicyRepository();

    await expect(
      setAbacPolicies(
        { policyRepository },
        {
          authorization: createAuthorization(),
          policies: [
            {
              id: 'policy-unknown-selector',
              effect: 'allow',
              actions: ['unknown.action'],
              resources: ['hr.people.profile'],
            },
          ],
        },
      ),
    ).rejects.toThrowError(ValidationError);

    expect(await policyRepository.getPoliciesForOrg('org-1')).toEqual([]);
    expect(invalidateOrgCacheMock).not.toHaveBeenCalled();
    expect(recordAuditEventMock).not.toHaveBeenCalled();
  });

  it('persists policies with known selectors and emits cache/audit side effects', async () => {
    const authorization = createAuthorization();
    const policyRepository = new InMemoryAbacPolicyRepository();
    const permissionResourceRepository = {
      listResources: vi.fn(async () => [
        createCustomPermissionResource('custom.audit.log', 'custom.audit.read'),
      ]),
    };

    const result = await setAbacPolicies(
      { policyRepository, permissionResourceRepository },
      {
        authorization,
        policies: [
          {
            id: 'custom-policy',
            effect: 'allow',
            actions: ['custom.audit.read'],
            resources: ['custom.audit.log'],
            priority: 20,
          },
          {
            id: 'prefix-policy',
            effect: 'allow',
            actions: ['hr.onboarding.*'],
            resources: ['hr.people.*'],
            priority: 5,
          },
        ],
      },
    );

    expect(result.policies.map((policy) => policy.id)).toEqual(['custom-policy', 'prefix-policy']);
    expect(await policyRepository.getPoliciesForOrg('org-1')).toEqual(result.policies);
    expect(invalidateOrgCacheMock).toHaveBeenCalledWith(
      'org-1',
      CACHE_SCOPE_ABAC_POLICIES,
      authorization.dataClassification,
      authorization.dataResidency,
    );
    expect(recordAuditEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
        userId: 'admin-1',
        action: 'abac.set',
        resource: 'org.abac.policy',
        payload: { policyCount: 2 },
      }),
    );
  });
});

