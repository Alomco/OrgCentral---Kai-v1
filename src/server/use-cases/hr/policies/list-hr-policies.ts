import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import { RepositoryAuthorizer, type RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { HRPolicy } from '@/server/types/hr-ops-types';

export interface ListHrPoliciesDependencies {
    policyRepository: IHRPolicyRepository;
}

export interface ListHrPoliciesInput {
    authorization: RepositoryAuthorizationContext;
    filters?: Parameters<IHRPolicyRepository['listPolicies']>[1];
}

export async function listHrPolicies(
    deps: ListHrPoliciesDependencies,
    input: ListHrPoliciesInput,
): Promise<HRPolicy[]> {
    const policies = await deps.policyRepository.listPolicies(
        input.authorization.orgId,
        input.filters,
    );

    const authorizer = RepositoryAuthorizer.default();
    return policies.map((policy) => authorizer.assertTenantRecord(policy, input.authorization));
}

