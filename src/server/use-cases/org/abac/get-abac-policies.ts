import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import type { AbacPolicy } from '@/server/security/abac-types';
import { AbacService, type AbacServiceOptions } from '@/server/security/abac';

// Use-case: retrieve ABAC policies for an organization via policy repositories under tenant guard.

export interface GetAbacPoliciesDependencies {
    policyRepository: IAbacPolicyRepository;
    abacServiceOptions?: AbacServiceOptions;
}

export interface GetAbacPoliciesInput {
    authorization: RepositoryAuthorizationContext;
}

export interface GetAbacPoliciesResult {
    policies: AbacPolicy[];
}

export async function getAbacPolicies(
    deps: GetAbacPoliciesDependencies,
    input: GetAbacPoliciesInput,
): Promise<GetAbacPoliciesResult> {
    const abacService = new AbacService(deps.policyRepository, deps.abacServiceOptions);
    const policies = await abacService.getPolicies(input.authorization.orgId);
    return { policies };
}
