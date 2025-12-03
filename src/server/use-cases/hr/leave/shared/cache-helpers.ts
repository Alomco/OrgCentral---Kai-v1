import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_LEAVE_BALANCES, CACHE_SCOPE_LEAVE_POLICIES, CACHE_SCOPE_LEAVE_REQUESTS } from '@/server/repositories/cache-scopes';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

type CacheScopeValue = typeof CACHE_SCOPE_LEAVE_REQUESTS | typeof CACHE_SCOPE_LEAVE_BALANCES | typeof CACHE_SCOPE_LEAVE_POLICIES;

export const LEAVE_CACHE_SCOPES = {
    requests: CACHE_SCOPE_LEAVE_REQUESTS,
    balances: CACHE_SCOPE_LEAVE_BALANCES,
    policies: CACHE_SCOPE_LEAVE_POLICIES,
} as const satisfies Record<string, CacheScopeValue>;

export type LeaveCacheScopeKey = keyof typeof LEAVE_CACHE_SCOPES;

export function registerLeaveCacheScopes(
    authorization: RepositoryAuthorizationContext,
    ...scopeKeys: LeaveCacheScopeKey[]
): void {
    if (!scopeKeys.length) {
        return;
    }

    const uniqueKeys = new Set(scopeKeys);
    for (const key of uniqueKeys) {
        registerOrgCacheTag(
            authorization.orgId,
            LEAVE_CACHE_SCOPES[key],
            authorization.dataClassification,
            authorization.dataResidency,
        );
    }
}

export async function invalidateLeaveCacheScopes(
    authorization: RepositoryAuthorizationContext,
    ...scopeKeys: LeaveCacheScopeKey[]
): Promise<void> {
    if (!scopeKeys.length) {
        return;
    }

    const uniqueKeys = new Set(scopeKeys);
    await Promise.all(
        Array.from(uniqueKeys).map((key) =>
            invalidateOrgCache(
                authorization.orgId,
                LEAVE_CACHE_SCOPES[key],
                authorization.dataClassification,
                authorization.dataResidency,
            ),
        ),
    );
}
