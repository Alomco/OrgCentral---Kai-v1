import { queryOptions } from '@tanstack/react-query';
import type { HRPolicy, HRPolicyListItem } from '@/server/types/hr-ops-types';

export const policyKeys = {
  all: (orgId: string) => ['hr', 'policies', orgId] as const,
  // Include q, nocat and includeContent in the cache key so query variants are isolated.
  list: (orgId: string, q?: string, nocat?: boolean, includeContent?: boolean) => [
    ...policyKeys.all(orgId),
    q ?? '',
    nocat ? 'nocat' : '',
    includeContent ? 'with-content' : 'summary',
  ] as const,
  detail: (orgId: string, policyId: string) => ['hr', 'policies', orgId, policyId] as const,
} as const;

async function fetchPolicyList<TPolicy extends HRPolicy | HRPolicyListItem>(
  q?: string,
  nocat?: boolean,
  includeContent?: boolean,
): Promise<TPolicy[]> {
  const usp = new URLSearchParams();
  if (q && q.trim().length > 0) { usp.set('q', q.trim()); }
  if (nocat) { usp.set('nocat', '1'); }
  if (includeContent) { usp.set('includeContent', '1'); }
  const qs = usp.toString();
  const url = qs.length > 0 ? `/api/hr/policies?${qs}` : '/api/hr/policies';
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) { throw new Error('Failed to load policies'); }
  const data = (await res.json()) as unknown as { policies?: TPolicy[] };
  return Array.isArray(data.policies) ? data.policies : [];
}

export function listPoliciesQuery(orgId: string, q?: string, nocat?: boolean) {
  return queryOptions({
    queryKey: policyKeys.list(orgId, q, nocat, false),
    queryFn: () => fetchPolicyList<HRPolicyListItem>(q, nocat, false),
    staleTime: 30_000,
  });
}

export function listPoliciesWithContentQuery(orgId: string, q?: string, nocat?: boolean) {
  return queryOptions({
    queryKey: policyKeys.list(orgId, q, nocat, true),
    queryFn: () => fetchPolicyList<HRPolicy>(q, nocat, true),
    staleTime: 30_000,
  });
}
