import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import type { HRPolicy, PolicyAcknowledgment } from '@/server/types/hr-ops-types';
import { acknowledgeHrPolicy } from '@/server/use-cases/hr/policies/acknowledge-hr-policy';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { EntityNotFoundError } from '@/server/errors';

const recordAuditEventMock = vi.mocked(recordAuditEvent);

const auditMocks = vi.hoisted(() => ({
    recordAuditEvent: vi.fn(),
    setAuditLogRepository: vi.fn(),
}));

vi.mock('@/server/logging/audit-logger', () => ({
    recordAuditEvent: auditMocks.recordAuditEvent,
    setAuditLogRepository: auditMocks.setAuditLogRepository,
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
        ipAddress: '203.0.113.5',
        userAgent: 'vitest',
        correlationId: 'corr-1',
        ...overrides,
    };
}

function buildPolicy(overrides: Partial<HRPolicy> = {}): HRPolicy {
    return {
        id: 'policy-1',
        orgId: 'org-1',
        title: 'Security Policy',
        content: 'Policy content',
        category: 'IT_SECURITY',
        version: 'v1',
        effectiveDate: new Date('2026-02-01T00:00:00.000Z'),
        expiryDate: null,
        applicableRoles: null,
        applicableDepartments: null,
        requiresAcknowledgment: true,
        status: 'ACTIVE',
        dataClassification: 'OFFICIAL',
        residencyTag: 'UK_ONLY',
        metadata: {},
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        ...overrides,
    };
}

describe('policy acknowledgment audit logging', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        recordAuditEventMock.mockClear();
    });

    it('records audit on acknowledgment', async () => {
        const authorization = buildAuthorization();
        const policy = buildPolicy();
        const acknowledgment: Omit<PolicyAcknowledgment, 'id'> = {
            orgId: authorization.orgId,
            userId: authorization.userId,
            policyId: policy.id,
            version: policy.version,
            acknowledgedAt: new Date('2026-02-10T12:00:00.000Z'),
            ipAddress: authorization.ipAddress,
            metadata: { channel: 'ui' },
        };

        const policyRepository: IHRPolicyRepository = {
            createPolicy: vi.fn(),
            updatePolicy: vi.fn(),
            getPolicy: vi.fn(async () => policy),
            listPolicies: vi.fn(),
        };

        const acknowledgmentRepository: IPolicyAcknowledgmentRepository = {
            acknowledgePolicy: vi.fn(async (orgId, input) => ({ id: 'ack-1', orgId, ...input })),
            getAcknowledgment: vi.fn(),
            listAcknowledgments: vi.fn(),
        };

        await acknowledgeHrPolicy(
            { policyRepository, acknowledgmentRepository },
            {
                authorization,
                acknowledgment,
            },
        );

        expect(recordAuditEventMock).toHaveBeenCalledTimes(1);
        expect(recordAuditEventMock).toHaveBeenCalledWith(expect.objectContaining({
            orgId: authorization.orgId,
            userId: authorization.userId,
            action: HR_ACTION.ACKNOWLEDGE,
            resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
            resourceId: 'ack-1',
            classification: authorization.dataClassification,
            residencyZone: authorization.dataResidency,
            auditSource: authorization.auditSource,
            correlationId: authorization.correlationId,
            payload: expect.objectContaining({
                policyId: policy.id,
                acknowledgedForUserId: authorization.userId,
                version: policy.version,
                ipAddress: authorization.ipAddress,
                userAgent: authorization.userAgent,
            }),
        }));
    });

    it('does not record audit when policy is missing', async () => {
        const authorization = buildAuthorization();
        const acknowledgment: Omit<PolicyAcknowledgment, 'id'> = {
            orgId: authorization.orgId,
            userId: authorization.userId,
            policyId: 'missing-policy',
            version: 'v1',
            acknowledgedAt: new Date('2026-02-10T12:00:00.000Z'),
            ipAddress: authorization.ipAddress,
            metadata: null,
        };

        const policyRepository: IHRPolicyRepository = {
            createPolicy: vi.fn(),
            updatePolicy: vi.fn(),
            getPolicy: vi.fn(async () => null),
            listPolicies: vi.fn(),
        };

        const acknowledgmentRepository: IPolicyAcknowledgmentRepository = {
            acknowledgePolicy: vi.fn(),
            getAcknowledgment: vi.fn(),
            listAcknowledgments: vi.fn(),
        };

        await expect(acknowledgeHrPolicy(
            { policyRepository, acknowledgmentRepository },
            { authorization, acknowledgment },
        )).rejects.toThrow(EntityNotFoundError);

        expect(recordAuditEventMock).not.toHaveBeenCalled();
    });
});
