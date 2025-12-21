import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_TIME_ENTRIES } from '@/server/repositories/cache-scopes';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export function registerTimeEntryCache(
    authorization: RepositoryAuthorizationContext,
): void {
    registerOrgCacheTag(
        authorization.orgId,
        CACHE_SCOPE_TIME_ENTRIES,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}

export async function invalidateTimeEntryCache(
    authorization: RepositoryAuthorizationContext,
): Promise<void> {
    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_TIME_ENTRIES,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}

