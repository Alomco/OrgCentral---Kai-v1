import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgPolicyActor } from '@/server/security/authorization/hr-policies';
import type { HRPolicy } from '@/server/types/hr-ops-types';

export interface CreateHrPolicyDependencies {
    policyRepository: IHRPolicyRepository;
}

export interface CreateHrPolicyInput {
    authorization: RepositoryAuthorizationContext;
    policy: Parameters<IHRPolicyRepository['createPolicy']>[1];
}

export async function createHrPolicy(
    deps: CreateHrPolicyDependencies,
    input: CreateHrPolicyInput,
): Promise<HRPolicy> {
    assertPrivilegedOrgPolicyActor(input.authorization);
    return deps.policyRepository.createPolicy(input.authorization.orgId, input.policy);
}

