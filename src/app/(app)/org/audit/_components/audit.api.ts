import { queryOptions } from '@tanstack/react-query';

export interface AuditFilters {
  eventType?: string;
  action?: string;
  resource?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export const auditKeys = {
  list: (orgId: string, params: string) => ['org', orgId, 'audit', params] as const,
} as const;

export interface AuditLogItem {
  id: string;
  eventType: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  userId?: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  logs: AuditLogItem[];
  nextCursor?: string;
}

export function listAuditLogsQuery(orgId: string, searchParams: URLSearchParams) {
  const key = searchParams.toString();
  return queryOptions({
    queryKey: auditKeys.list(orgId, key),
    queryFn: async (): Promise<AuditLogListResponse> => {
      const url = `/api/org/${orgId}/audit/logs?${key}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) {throw new Error('Failed to load audit logs');}
      const data = (await res.json()) as AuditLogListResponse;
      return data;
    },
    staleTime: 30_000,
  });
}
