import type {
  AbsenceAttachmentInput,
  AbsenceDeletionAuditEntry,
  ReturnToWorkRecordInput,
  UnplannedAbsence,
} from '@/server/types/hr-ops-types';

export interface IUnplannedAbsenceRepository {
  createAbsence(orgId: string, input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: UnplannedAbsence['status'] }): Promise<UnplannedAbsence>;
  updateAbsence(
    orgId: string,
    id: string,
    updates: Partial<
      Pick<
        UnplannedAbsence,
        | 'status'
        | 'reason'
        | 'approverOrgId'
        | 'approverUserId'
        | 'healthStatus'
        | 'metadata'
        | 'dataClassification'
        | 'residencyTag'
        | 'startDate'
        | 'endDate'
        | 'hours'
        | 'deletionReason'
        | 'deletedAt'
        | 'deletedByUserId'
      >
    >
  ): Promise<UnplannedAbsence>;
  recordReturnToWork(
    orgId: string,
    id: string,
    record: ReturnToWorkRecordInput,
  ): Promise<UnplannedAbsence>;
  addAttachments(
    orgId: string,
    id: string,
    attachments: readonly AbsenceAttachmentInput[],
  ): Promise<UnplannedAbsence>;
  removeAttachment(orgId: string, id: string, attachmentId: string): Promise<UnplannedAbsence>;
  deleteAbsence(
    orgId: string,
    id: string,
    audit: AbsenceDeletionAuditEntry,
  ): Promise<void>;
  getAbsence(orgId: string, id: string): Promise<UnplannedAbsence | null>;
  listAbsences(orgId: string, filters?: { userId?: string; status?: UnplannedAbsence['status']; includeClosed?: boolean; from?: Date; to?: Date }): Promise<UnplannedAbsence[]>;
}
