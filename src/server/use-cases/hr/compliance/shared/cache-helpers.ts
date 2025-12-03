import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
  HR_COMPLIANCE_CACHE_SCOPES,
  invalidateComplianceItems,
  invalidateComplianceStatus,
  registerComplianceItemsTag,
  registerComplianceStatusTag,
} from '@/server/lib/cache-tags/hr-compliance';

function toCacheContext(authorization: RepositoryAuthorizationContext) {
  return {
    orgId: authorization.orgId,
    classification: authorization.dataClassification,
    residency: authorization.dataResidency,
  };
}

export function registerComplianceStatusCache(
  authorization: RepositoryAuthorizationContext,
): void {
  registerComplianceStatusTag(toCacheContext(authorization));
}

export function registerComplianceItemsCache(
  authorization: RepositoryAuthorizationContext,
): void {
  registerComplianceItemsTag(toCacheContext(authorization));
}

export async function invalidateComplianceStatusCache(
  authorization: RepositoryAuthorizationContext,
): Promise<void> {
  await invalidateComplianceStatus(toCacheContext(authorization));
}

export async function invalidateComplianceItemsCache(
  authorization: RepositoryAuthorizationContext,
): Promise<void> {
  await invalidateComplianceItems(toCacheContext(authorization));
}

export async function invalidateComplianceCachesAfterPeopleMutation(
  authorization: RepositoryAuthorizationContext,
): Promise<void> {
  await Promise.all([
    invalidateComplianceStatusCache(authorization),
    invalidateComplianceItemsCache(authorization),
  ]);
}

export const COMPLIANCE_CACHE_METADATA = {
  status: { cacheScope: HR_COMPLIANCE_CACHE_SCOPES.status },
  items: { cacheScope: HR_COMPLIANCE_CACHE_SCOPES.items },
} as const;
