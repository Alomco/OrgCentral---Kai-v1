import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface IUnplannedAbsenceRepository {
  createAbsence(orgId: string, input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: UnplannedAbsence['status'] }): Promise<UnplannedAbsence>;
  updateAbsence(
    orgId: string,
    id: string,
    updates: Partial<Pick<UnplannedAbsence, 'status' | 'reason' | 'approverOrgId' | 'approverUserId' | 'healthStatus' | 'metadata' | 'dataClassification' | 'residencyTag'>>
  ): Promise<UnplannedAbsence>;
  getAbsence(orgId: string, id: string): Promise<UnplannedAbsence | null>;
  listAbsences(orgId: string, filters?: { userId?: string; status?: UnplannedAbsence['status']; includeClosed?: boolean; from?: Date; to?: Date }): Promise<UnplannedAbsence[]>;
}
