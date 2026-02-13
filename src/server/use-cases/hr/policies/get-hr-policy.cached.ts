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

import { getHrPolicy } from './get-hr-policy';

export interface GetHrPolicyForUiInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
}

export interface GetHrPolicyForUiResult {
    policy: HRPolicy | null;
}

function resolvePolicyRepository(): IHRPolicyRepository {
    return buildHrPolicyServiceDependencies().policyRepository;
}

export async function getHrPolicyForUi(input: GetHrPolicyForUiInput): Promise<GetHrPolicyForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.POLICY,
        resourceId: input.policyId,
    });
    async function getPolicyCached(cachedInput: GetHrPolicyForUiInput): Promise<GetHrPolicyForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_HR_POLICIES,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );

        const policy = await getHrPolicy(
            { policyRepository: resolvePolicyRepository() },
            { authorization: cachedInput.authorization, policyId: cachedInput.policyId },
        );

        return { policy };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const policy = await getHrPolicy(
            { policyRepository: resolvePolicyRepository() },
            { authorization: input.authorization, policyId: input.policyId },
        );
        return { policy };
    }

    return getPolicyCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
