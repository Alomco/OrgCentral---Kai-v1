import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_HR_SETTINGS } from '@/server/repositories/cache-scopes';

export function registerHrSettingsCacheTag(
    authorization: RepositoryAuthorizationContext,
): void {
    registerOrgCacheTag(
        authorization.orgId,
        CACHE_SCOPE_HR_SETTINGS,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}

export async function invalidateHrSettingsCacheTag(
    authorization: RepositoryAuthorizationContext,
): Promise<void> {
    await invalidateOrgCache(
        authorization.orgId,
        CACHE_SCOPE_HR_SETTINGS,
        authorization.dataClassification,
        authorization.dataResidency,
    );
}
