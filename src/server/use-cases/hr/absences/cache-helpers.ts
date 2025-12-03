import { invalidateCache } from '@/server/lib/cache-tags';
import {
    HR_ABSENCE_CACHE_SCOPES,
    resolveAbsenceCacheScopes,
} from '@/server/lib/cache-tags/hr-absences';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export async function invalidateAbsenceScopeCache(
    authorization: RepositoryAuthorizationContext,
    additionalScopes: readonly string[] = [],
): Promise<void> {
    const scopes = new Set(resolveAbsenceCacheScopes());
    for (const scope of additionalScopes) {
        scopes.add(scope);
    }

    for (const scope of scopes) {
        await invalidateCache({
            orgId: authorization.orgId,
            scope,
            classification: authorization.dataClassification,
            residency: authorization.dataResidency,
        });
    }
}

export function buildLeaveBalanceScopes(): string[] {
    return [HR_ABSENCE_CACHE_SCOPES.leaveBalances];
}

export function buildAiValidationScopes(): string[] {
    return [HR_ABSENCE_CACHE_SCOPES.aiValidation];
}
