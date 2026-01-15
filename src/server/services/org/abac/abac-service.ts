import { buildAbacPolicyServiceDependencies } from '@/server/repositories/providers/org/abac-policy-service-dependencies';
import { getAbacPolicies as getAbacPoliciesUseCase } from '@/server/use-cases/org/abac/get-abac-policies';
import { setAbacPolicies as setAbacPoliciesUseCase } from '@/server/use-cases/org/abac/set-abac-policies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { z } from 'zod';
import { type abacPolicySchema } from '@/server/security/abac-policy-normalizer';

export type AbacPolicyInput = z.infer<typeof abacPolicySchema>;

export async function getAbacPolicies(authorization: RepositoryAuthorizationContext) {
    const { abacPolicyRepository } = buildAbacPolicyServiceDependencies();
    return getAbacPoliciesUseCase({ policyRepository: abacPolicyRepository }, { authorization });
}

export async function setAbacPolicies(
    authorization: RepositoryAuthorizationContext,
    policies: AbacPolicyInput[],
) {
    const { abacPolicyRepository } = buildAbacPolicyServiceDependencies();
    return setAbacPoliciesUseCase({ policyRepository: abacPolicyRepository }, { authorization, policies });
}