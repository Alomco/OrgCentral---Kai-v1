import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import { getComplianceAnalytics } from './get-compliance-analytics';

export interface GetComplianceAnalyticsForUiInput {
    authorization: RepositoryAuthorizationContext;
    take?: number;
}

export type GetComplianceAnalyticsForUiResult = Awaited<ReturnType<typeof getComplianceAnalytics>>;

function resolveDependencies() {
    const { complianceItemRepository } = buildComplianceRepositoryDependencies();
    return { complianceItemRepository };
}

export async function getComplianceAnalyticsForUi(
    input: GetComplianceAnalyticsForUiInput,
): Promise<GetComplianceAnalyticsForUiResult> {
    async function getCached(
        cachedInput: GetComplianceAnalyticsForUiInput,
    ): Promise<GetComplianceAnalyticsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return getComplianceAnalytics(resolveDependencies(), cachedInput);
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getComplianceAnalytics(resolveDependencies(), input);
    }

    return getCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
