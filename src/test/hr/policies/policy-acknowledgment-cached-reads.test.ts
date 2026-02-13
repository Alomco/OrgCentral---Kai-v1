import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { getPolicyAcknowledgmentForUi } from '@/server/use-cases/hr/policies/get-policy-acknowledgment.cached';
import { listPolicyAcknowledgmentsForUi } from '@/server/use-cases/hr/policies/list-policy-acknowledgments.cached';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { AuthorizationError } from '@/server/errors';
import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';

const mocks = vi.hoisted(() => ({
    cacheLifeMock: vi.fn(),
    noStoreMock: vi.fn(),
    recordHrCachedReadAuditMock: vi.fn().mockResolvedValue(undefined),
    getPolicyAcknowledgmentMock: vi.fn(),
    listPolicyAcknowledgmentsMock: vi.fn(),
}));

vi.mock('next/cache', () => ({
    cacheLife: mocks.cacheLifeMock,
    unstable_noStore: mocks.noStoreMock,
}));

vi.mock('@/server/use-cases/hr/audit/record-hr-cached-read-audit', () => ({
    recordHrCachedReadAudit: mocks.recordHrCachedReadAuditMock,
}));

vi.mock('@/server/use-cases/hr/policies/get-policy-acknowledgment', () => ({
    getPolicyAcknowledgment: mocks.getPolicyAcknowledgmentMock,
}));

vi.mock('@/server/use-cases/hr/policies/list-policy-acknowledgments', () => ({
    listPolicyAcknowledgments: mocks.listPolicyAcknowledgmentsMock,
}));

vi.mock('@/server/repositories/providers/hr/hr-policy-service-dependencies', () => ({
    buildHrPolicyServiceDependencies: () => ({
        policyRepository: {},
        acknowledgmentRepository: {},
    }),
}));

function buildAuthorization(
    overrides: Partial<RepositoryAuthorizationContext> = {},
): RepositoryAuthorizationContext {
    return {
        orgId: 'org-1',
        userId: 'user-1',
        dataClassification: 'OFFICIAL',
        dataResidency: 'UK_ONLY',
        auditSource: 'tests',
        tenantScope: {
            orgId: 'org-1',
            dataClassification: 'OFFICIAL',
            dataResidency: 'UK_ONLY',
            auditSource: 'tests',
        },
        roleKey: 'custom',
        permissions: {},
        ...overrides,
    };
}

describe('policy acknowledgment cached reads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('records audit for policy acknowledgment list', async () => {
        mocks.listPolicyAcknowledgmentsMock.mockResolvedValue([]);

        const authorization = buildAuthorization();
        const result = await listPolicyAcknowledgmentsForUi({
            authorization,
            policyId: 'policy-1',
        });

        expect(result.acknowledgments).toEqual([]);
        expect(mocks.cacheLifeMock).toHaveBeenCalledWith(CACHE_LIFE_SHORT);
        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith(expect.objectContaining({
            authorization,
            action: HR_ACTION.LIST,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            outcome: 'ALLOW',
            cache: expect.objectContaining({
                eligible: true,
                mode: 'cache',
            }),
            payload: expect.objectContaining({
                policyId: 'policy-1',
                version: null,
                acknowledgmentCount: 0,
            }),
        }));
    });

    it('uses no-store for non-official policy acknowledgment reads', async () => {
        mocks.getPolicyAcknowledgmentMock.mockResolvedValue(null);

        const authorization = buildAuthorization({ dataClassification: 'SECRET' });
        const result = await getPolicyAcknowledgmentForUi({
            authorization,
            policyId: 'policy-1',
            userId: 'user-1',
        });

        expect(result.acknowledgment).toBeNull();
        expect(mocks.noStoreMock).toHaveBeenCalledTimes(1);
        expect(mocks.getPolicyAcknowledgmentMock).toHaveBeenCalledTimes(1);
        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith(expect.objectContaining({
            authorization,
            action: HR_ACTION.READ,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            outcome: 'ALLOW',
            cache: expect.objectContaining({
                eligible: false,
                mode: 'no-store',
            }),
            payload: expect.objectContaining({
                userId: 'user-1',
                acknowledgmentFound: false,
            }),
        }));
    });

    it('uses cacheLife for official policy acknowledgment reads', async () => {
        mocks.getPolicyAcknowledgmentMock.mockResolvedValue(null);

        const authorization = buildAuthorization({ dataClassification: 'OFFICIAL' });
        const result = await getPolicyAcknowledgmentForUi({
            authorization,
            policyId: 'policy-1',
            userId: 'user-1',
        });

        expect(result.acknowledgment).toBeNull();
        expect(mocks.cacheLifeMock).toHaveBeenCalledWith(CACHE_LIFE_SHORT);
        expect(mocks.noStoreMock).not.toHaveBeenCalled();
        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith(expect.objectContaining({
            authorization,
            action: HR_ACTION.READ,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            outcome: 'ALLOW',
            cache: expect.objectContaining({
                eligible: true,
                mode: 'cache',
            }),
            payload: expect.objectContaining({
                userId: 'user-1',
                acknowledgmentFound: false,
            }),
        }));
    });

    it('records deny audit when get is unauthorized', async () => {
        mocks.getPolicyAcknowledgmentMock.mockRejectedValue(new AuthorizationError('Denied'));

        const authorization = buildAuthorization({ dataClassification: 'OFFICIAL' });

        await expect(getPolicyAcknowledgmentForUi({
            authorization,
            policyId: 'policy-1',
            userId: 'user-2',
        })).rejects.toThrow(AuthorizationError);

        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith(expect.objectContaining({
            authorization,
            action: HR_ACTION.READ,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            outcome: 'DENY',
            cache: expect.objectContaining({
                eligible: expect.any(Boolean),
                mode: expect.any(String),
            }),
            payload: expect.objectContaining({
                userId: 'user-2',
                reason: 'AUTHORIZATION_ERROR',
            }),
        }));
    });

    it('records deny audit when list is unauthorized', async () => {
        mocks.listPolicyAcknowledgmentsMock.mockRejectedValue(new AuthorizationError('Denied'));

        const authorization = buildAuthorization({ dataClassification: 'OFFICIAL' });

        await expect(listPolicyAcknowledgmentsForUi({
            authorization,
            policyId: 'policy-1',
        })).rejects.toThrow(AuthorizationError);

        expect(mocks.recordHrCachedReadAuditMock).toHaveBeenCalledWith(expect.objectContaining({
            authorization,
            action: HR_ACTION.LIST,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            outcome: 'DENY',
            cache: expect.objectContaining({
                eligible: expect.any(Boolean),
                mode: expect.any(String),
            }),
            payload: expect.objectContaining({
                policyId: 'policy-1',
                reason: 'AUTHORIZATION_ERROR',
            }),
        }));
    });
});