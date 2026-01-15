import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export function buildPolicyCacheKey(
  context: RepositoryAuthorizationContext,
  operation: string,
  resourceType: string,
  resourceId: string | undefined,
): string {
  return `${context.orgId}:${context.userId}:${operation}:${resourceType}:${resourceId ?? 'none'}:${context.dataClassification}:${context.dataResidency}:${String(context.mfaVerified)}`;
}
