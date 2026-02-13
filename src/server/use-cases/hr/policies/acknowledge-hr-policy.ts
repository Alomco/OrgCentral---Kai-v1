import { EntityNotFoundError } from '@/server/errors';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import { RepositoryAuthorizer, type RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPolicyAcknowledgmentActor } from '@/server/security/authorization/hr-policies';
import type { HRPolicy, PolicyAcknowledgment } from '@/server/types/hr-ops-types';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';

export interface AcknowledgeHrPolicyDependencies {
    policyRepository: IHRPolicyRepository;
    acknowledgmentRepository: IPolicyAcknowledgmentRepository;
}

export interface AcknowledgeHrPolicyInput {
    authorization: RepositoryAuthorizationContext;
    acknowledgment: Omit<PolicyAcknowledgment, 'id'>;
}

export interface AcknowledgeHrPolicyResult {
    policy: HRPolicy;
    acknowledgment: PolicyAcknowledgment;
}

export async function acknowledgeHrPolicy(
    deps: AcknowledgeHrPolicyDependencies,
    input: AcknowledgeHrPolicyInput,
): Promise<AcknowledgeHrPolicyResult> {
    assertPolicyAcknowledgmentActor(input.authorization, input.acknowledgment.userId);

    const policy = await deps.policyRepository.getPolicy(
        input.authorization.orgId,
        input.acknowledgment.policyId,
    );

    if (!policy) {
        throw new EntityNotFoundError('HRPolicy', { policyId: input.acknowledgment.policyId });
    }

    RepositoryAuthorizer.default().assertTenantRecord(policy, input.authorization);

    const acknowledgment = await deps.acknowledgmentRepository.acknowledgePolicy(
        input.authorization.orgId,
        input.acknowledgment,
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'DATA_CHANGE',
        action: HR_ACTION.ACKNOWLEDGE,
        resource: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
        resourceId: acknowledgment.id,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        payload: {
            policyId: input.acknowledgment.policyId,
            acknowledgedForUserId: input.acknowledgment.userId,
            version: input.acknowledgment.version,
            ipAddress: input.authorization.ipAddress ?? null,
            userAgent: input.authorization.userAgent ?? null,
        },
    });

    return { policy, acknowledgment };
}

