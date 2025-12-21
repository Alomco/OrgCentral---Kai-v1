import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import { RepositoryAuthorizer, type RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRPolicy } from '@/server/types/hr-ops-types';

export interface GetHrPolicyDependencies {
    policyRepository: IHRPolicyRepository;
}

export interface GetHrPolicyInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
}

export async function getHrPolicy(
    deps: GetHrPolicyDependencies,
    input: GetHrPolicyInput,
): Promise<HRPolicy | null> {
    const policy = await deps.policyRepository.getPolicy(input.authorization.orgId, input.policyId);
    if (!policy) {
        return null;
    }
    return RepositoryAuthorizer.default().assertTenantRecord(policy, input.authorization);
}

