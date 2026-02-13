import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_LONG } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { AuthorizationError } from '@/server/errors';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OnboardingMetricDefinitionRecord } from '@/server/types/hr/onboarding-metrics';
import { CACHE_SCOPE_ONBOARDING_METRICS } from '@/server/repositories/cache-scopes';
import { buildOnboardingMetricsDependencies } from '@/server/repositories/providers/hr/onboarding-metrics-repository-dependencies';
import { listMetricDefinitions } from './list-metric-definitions';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetMetricDefinitionsForUiInput {
    authorization: RepositoryAuthorizationContext;
    isActive?: boolean;
}

export interface GetMetricDefinitionsForUiResult {
    definitions: OnboardingMetricDefinitionRecord[];
    canManageMetrics: boolean;
}

async function loadDefinitions(
    input: GetMetricDefinitionsForUiInput,
): Promise<GetMetricDefinitionsForUiResult> {
    try {
        const result = await listMetricDefinitions(
            { definitionRepository: buildOnboardingMetricsDependencies().definitionRepository },
            input,
        );
        return { definitions: result.definitions, canManageMetrics: true };
    } catch (error) {
        if (error instanceof AuthorizationError) {
            return { definitions: [], canManageMetrics: false };
        }
        throw error;
    }
}

export async function getMetricDefinitionsForUi(
    input: GetMetricDefinitionsForUiInput,
): Promise<GetMetricDefinitionsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ONBOARDING_METRIC_DEFINITION,
        payload: {
            isActive: input.isActive ?? null,
        },
    });
    async function getDefinitionsCached(
        cachedInput: GetMetricDefinitionsForUiInput,
    ): Promise<GetMetricDefinitionsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_LONG);

        registerOrgCacheTag(
            cachedInput.authorization.orgId,
            CACHE_SCOPE_ONBOARDING_METRICS,
            cachedInput.authorization.dataClassification,
            cachedInput.authorization.dataResidency,
        );

        return loadDefinitions(cachedInput);
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return loadDefinitions(input);
    }

    return getDefinitionsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
