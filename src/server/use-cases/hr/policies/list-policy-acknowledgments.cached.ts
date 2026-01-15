import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_HR_POLICIES, CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS } from '@/server/repositories/cache-scopes';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import { buildHrPolicyServiceDependencies } from '@/server/repositories/providers/hr/hr-policy-service-dependencies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

import { listPolicyAcknowledgments } from './list-policy-acknowledgments';

export interface ListPolicyAcknowledgmentsForUiInput {
    authorization: RepositoryAuthorizationContext;
    policyId: string;
    version?: string;
}

export interface ListPolicyAcknowledgmentsForUiResult {
    acknowledgments: PolicyAcknowledgment[];
}

function resolveAcknowledgmentRepository(): IPolicyAcknowledgmentRepository {
    return buildHrPolicyServiceDependencies().acknowledgmentRepository;
}

function resolvePolicyRepository(): IHRPolicyRepository {
    return buildHrPolicyServiceDependencies().policyRepository;
}

export async function listPolicyAcknowledgmentsForUi(
    input: ListPolicyAcknowledgmentsForUiInput,
): Promise<ListPolicyAcknowledgmentsForUiResult> {
    async function listAcknowledgmentsCached(
        cachedInput: ListPolicyAcknowledgmentsForUiInput,
    ): Promise<ListPolicyAcknowledgmentsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_HR_POLICIES,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );
        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );

        const acknowledgments = await listPolicyAcknowledgments(
            {
                policyRepository: resolvePolicyRepository(),
                acknowledgmentRepository: resolveAcknowledgmentRepository(),
            },
            {
                authorization: cachedInput.authorization,
                policyId: cachedInput.policyId,
                version: cachedInput.version,
            },
        );

        return { acknowledgments };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const acknowledgments = await listPolicyAcknowledgments(
            {
                policyRepository: resolvePolicyRepository(),
                acknowledgmentRepository: resolveAcknowledgmentRepository(),
            },
            {
                authorization: input.authorization,
                policyId: input.policyId,
                version: input.version,
            },
        );
        return { acknowledgments };
    }

    return listAcknowledgmentsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
