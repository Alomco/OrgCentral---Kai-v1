import type { ComplianceItemStatus } from '@/server/types/compliance-types';

export interface ComplianceStatusSnapshot {
  status: ComplianceItemStatus | 'NOT_APPLICABLE';
  itemCount: number;
}

export interface IComplianceStatusRepository {
  recalculateForUser(orgId: string, userId: string): Promise<ComplianceStatusSnapshot | null>;
}
