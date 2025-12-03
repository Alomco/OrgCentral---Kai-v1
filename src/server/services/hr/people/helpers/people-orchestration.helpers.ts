import { invalidateCache } from '@/server/lib/cache-tags';
import { resolveIdentityCacheScopes } from '@/server/lib/cache-tags/identity';
import {
    invalidateContractsAfterMutation,
    invalidateProfilesAfterMutation,
    registerContractsCache,
    registerProfilesCache,
} from '@/server/use-cases/hr/people/shared/cache-helpers';
import { invalidateAbsenceScopeCache } from '@/server/use-cases/hr/absences/cache-helpers';
import {
    invalidateLeaveCacheScopes,
    registerLeaveCacheScopes,
    type LeaveCacheScopeKey,
} from '@/server/use-cases/hr/leave/shared/cache-helpers';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

type TelemetryMetadata = Record<string, unknown>;

const DEFAULT_ELIGIBILITY_SCOPES: LeaveCacheScopeKey[] = ['balances', 'requests'];
const DEFAULT_TERMINATION_SCOPES: LeaveCacheScopeKey[] = ['requests', 'balances'];

export function registerSummaryCaches(authorization: RepositoryAuthorizationContext): void {
    registerProfilesCache(authorization);
    registerContractsCache(authorization);
    registerLeaveCacheScopes(authorization, 'requests', 'balances');
}

export async function invalidateOnboardCaches(authorization: RepositoryAuthorizationContext): Promise<void> {
    await Promise.all([
        invalidateProfilesAfterMutation(authorization),
        invalidateContractsAfterMutation(authorization),
        invalidateLeaveCacheScopes(authorization, 'requests', 'balances'),
        invalidateAbsenceScopeCache(authorization),
    ]);
}

export async function invalidateEligibilityCaches(
    authorization: RepositoryAuthorizationContext,
    leaveScopes: LeaveCacheScopeKey[] = DEFAULT_ELIGIBILITY_SCOPES,
): Promise<void> {
    const scopes = leaveScopes.length > 0 ? leaveScopes : [...DEFAULT_ELIGIBILITY_SCOPES];

    await Promise.all([
        invalidateProfilesAfterMutation(authorization),
        invalidateLeaveCacheScopes(authorization, ...scopes),
    ]);
}

export async function invalidateTerminationCaches(
    authorization: RepositoryAuthorizationContext,
    leaveScopes: LeaveCacheScopeKey[] = DEFAULT_TERMINATION_SCOPES,
): Promise<void> {
    const identityScopes = resolveIdentityCacheScopes();
    const leaveScopesToClear = leaveScopes.length > 0 ? leaveScopes : [...DEFAULT_TERMINATION_SCOPES];

    await Promise.all([
        invalidateProfilesAfterMutation(authorization),
        invalidateContractsAfterMutation(authorization),
        invalidateLeaveCacheScopes(authorization, ...leaveScopesToClear),
        invalidateAbsenceScopeCache(authorization),
        ...identityScopes.map((scope) =>
            invalidateCache({
                orgId: authorization.orgId,
                scope,
                classification: authorization.dataClassification,
                residency: authorization.dataResidency,
            }),
        ),
    ]);
}

export async function invalidateComplianceAssignmentCaches(
    authorization: RepositoryAuthorizationContext,
): Promise<void> {
    await invalidateProfilesAfterMutation(authorization);
}

export function buildTelemetryMetadata(
    operation: string,
    authorization: RepositoryAuthorizationContext,
    metadata?: TelemetryMetadata,
): TelemetryMetadata {
    return {
        auditSource: `service:hr:people.${operation}`,
        orgId: authorization.orgId,
        userId: authorization.userId,
        residency: authorization.dataResidency,
        classification: authorization.dataClassification,
        ...metadata,
    };
}
