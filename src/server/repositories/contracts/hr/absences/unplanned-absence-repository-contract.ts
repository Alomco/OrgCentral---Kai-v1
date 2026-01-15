import type {
  AbsenceAttachmentInput,
  AbsenceDeletionAuditEntry,
  ReturnToWorkRecordInput,
  UnplannedAbsence,
} from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface IUnplannedAbsenceRepository {
  createAbsence(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: UnplannedAbsence['status'] },
  ): Promise<UnplannedAbsence>;
  updateAbsence(
    contextOrOrgId: RepositoryAuthorizationContext | string,
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
    contextOrOrgId: RepositoryAuthorizationContext | string,
    id: string,
    record: ReturnToWorkRecordInput,
  ): Promise<UnplannedAbsence>;
  addAttachments(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    id: string,
    attachments: readonly AbsenceAttachmentInput[],
  ): Promise<UnplannedAbsence>;
  removeAttachment(context: RepositoryAuthorizationContext, id: string, attachmentId: string): Promise<UnplannedAbsence>;
  deleteAbsence(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    id: string,
    audit: AbsenceDeletionAuditEntry,
  ): Promise<void>;
  getAbsence(contextOrOrgId: RepositoryAuthorizationContext | string, id: string): Promise<UnplannedAbsence | null>;
  listAbsences(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    filters?: { userId?: string; status?: UnplannedAbsence['status']; includeClosed?: boolean; from?: Date; to?: Date },
  ): Promise<UnplannedAbsence[]>;
}
