import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_HR_POLICIES } from '@/server/repositories/cache-scopes';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import { buildHrPolicyServiceDependencies } from '@/server/repositories/providers/hr/hr-policy-service-dependencies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { HRPolicy } from '@/server/types/hr-ops-types';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { listHrPolicies } from './list-hr-policies';

export interface ListHrPoliciesForUiInput {
    authorization: RepositoryAuthorizationContext;
    filters?: Parameters<IHRPolicyRepository['listPolicies']>[1];
}

export interface ListHrPoliciesForUiResult {
    policies: HRPolicy[];
}

function resolvePolicyRepository(): IHRPolicyRepository {
    return buildHrPolicyServiceDependencies().policyRepository;
}

export async function listHrPoliciesForUi(
    input: ListHrPoliciesForUiInput,
): Promise<ListHrPoliciesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.POLICY,
    });
    async function listPoliciesCached(
        cachedInput: ListHrPoliciesForUiInput,
    ): Promise<ListHrPoliciesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_HR_POLICIES,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );

        const policies = await listHrPolicies(
            { policyRepository: resolvePolicyRepository() },
            { authorization: cachedInput.authorization, filters: cachedInput.filters },
        );

        return { policies };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const policies = await listHrPolicies(
            { policyRepository: resolvePolicyRepository() },
            { authorization: input.authorization, filters: input.filters },
        );
        return { policies };
    }

    return listPoliciesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
