import { queryOptions } from '@tanstack/react-query';
import type { ComplianceTemplate } from '@/server/types/compliance-types';

export const templatesKey = {
  all: ['hr', 'compliance', 'templates'] as const,
  list: (q: string) => [...templatesKey.all, 'q', q] as const,
} as const;

export interface ComplianceTemplatesListResponse {
  templates: ComplianceTemplate[];
}

export async function fetchComplianceTemplates(q: string): Promise<ComplianceTemplatesListResponse> {
  const url = new URL('/api/hr/compliance/templates', typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (q.trim().length > 0) {url.searchParams.set('q', q.trim());}
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) { throw new Error('Failed to load compliance templates'); }
  const data = (await res.json()) as { success?: boolean; templates?: ComplianceTemplate[] };
  return { templates: data.templates ?? [] };
}

export function listTemplatesQuery(q: string) {
  return queryOptions({
    queryKey: templatesKey.list(q),
    queryFn: () => fetchComplianceTemplates(q),
    staleTime: 60_000,
  });
}
