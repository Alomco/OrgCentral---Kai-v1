import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_TRAINING_RECORDS } from '@/server/repositories/cache-scopes';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export function registerTrainingCache(authorization: RepositoryAuthorizationContext): void {
    registerOrgCacheTag(
        authorization.orgId,
        CACHE_SCOPE_TRAINING_RECORDS,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}

export async function invalidateTrainingCache(
    authorization: RepositoryAuthorizationContext,
): Promise<void> {
    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_TRAINING_RECORDS,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}
