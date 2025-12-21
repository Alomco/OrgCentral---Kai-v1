import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import { RepositoryAuthorizer, type RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPolicyAcknowledgmentActor } from '@/server/security/authorization/hr-policies';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

export interface GetPolicyAcknowledgmentDependencies {
    policyRepository: IHRPolicyRepository;
    acknowledgmentRepository: IPolicyAcknowledgmentRepository;
}

export interface GetPolicyAcknowledgmentInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    userId: string;
}

export async function getPolicyAcknowledgment(
    deps: GetPolicyAcknowledgmentDependencies,
    input: GetPolicyAcknowledgmentInput,
): Promise<PolicyAcknowledgment | null> {
    assertPolicyAcknowledgmentActor(input.authorization, input.userId);

    const policy = await deps.policyRepository.getPolicy(input.authorization.orgId, input.policyId);
    if (!policy) {
        return null;
    }

    RepositoryAuthorizer.default().assertTenantRecord(policy, input.authorization);

    return deps.acknowledgmentRepository.getAcknowledgment(
        input.authorization.orgId,
        input.policyId,
        input.userId,
        policy.version,
    );
}

