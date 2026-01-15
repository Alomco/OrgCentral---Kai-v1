import type {
  AbsenceAttachment,
  AbsenceDeletionAuditEntry,
  AbsenceSettings,
  AbsenceTypeConfig,
  ReturnToWorkRecord,
  UnplannedAbsence,
} from '@/server/types/hr-ops-types';
import { toNumber } from '@/server/domain/absences/conversions';
import type {
  AbsenceAttachmentRecord,
  AbsenceDeletionAuditRecord,
  AbsenceReturnRecord,
  AbsenceSettingsCreateArguments,
  AbsenceSettingsRecord,
  AbsenceTypeConfigCreatePayload,
  AbsenceTypeConfigRecord,
  AbsenceTypeConfigUpdatePayload,
  UnplannedAbsenceCreatePayload,
  UnplannedAbsenceRecord,
  UnplannedAbsenceUpdatePayload,
} from './absences-records';
import { toPrismaInputJson } from '@/server/repositories/prisma/helpers/prisma-utils';

export function mapPrismaAbsenceTypeConfigToDomain(record: AbsenceTypeConfigRecord): AbsenceTypeConfig {
  return {
    id: record.id,
    orgId: record.orgId,
    key: record.key,
    label: record.label,
    tracksBalance: record.tracksBalance,
    isActive: record.isActive,
    metadata: record.metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainAbsenceTypeConfigToPrismaCreate(
  input: Omit<AbsenceTypeConfig, 'id' | 'createdAt' | 'updatedAt'>,
): AbsenceTypeConfigCreatePayload {
  return {
    orgId: input.orgId,
    key: input.key,
    label: input.label,
    tracksBalance: input.tracksBalance,
    isActive: input.isActive,
    metadata: toPrismaInputJson(input.metadata),
  };
}

export function mapDomainAbsenceTypeConfigToPrismaUpdate(
  updates: Partial<Pick<AbsenceTypeConfig, 'label' | 'tracksBalance' | 'isActive' | 'metadata'>>,
): AbsenceTypeConfigUpdatePayload {
  return {
    label: updates.label,
    tracksBalance: updates.tracksBalance,
    isActive: updates.isActive,
    metadata: toPrismaInputJson(updates.metadata),
  };
}

export function mapPrismaAbsenceSettingsToDomain(record: AbsenceSettingsRecord): AbsenceSettings {
  return {
    orgId: record.orgId,
    hoursInWorkDay: toNumber(record.hoursInWorkDay),
    roundingRule: record.roundingRule ?? undefined,
    metadata: record.metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainAbsenceSettingsToPrismaUpsert(
  orgId: string,
  input: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>,
): AbsenceSettingsCreateArguments {
  return {
    orgId,
    hoursInWorkDay: toNumber(input.hoursInWorkDay),
    roundingRule: input.roundingRule ?? null,
    metadata: toPrismaInputJson(input.metadata),
  };
}

type PrismaUnplannedAbsenceWithRelations = UnplannedAbsenceRecord & {
  attachments?: AbsenceAttachmentRecord[] | null;
  returnRecord?: AbsenceReturnRecord | null;
  deletionAudit?: AbsenceDeletionAuditRecord | null;
};

export function mapPrismaUnplannedAbsenceToDomain(
  record: PrismaUnplannedAbsenceWithRelations,
): UnplannedAbsence {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    typeId: record.typeId,
    startDate: record.startDate,
    endDate: record.endDate,
    hours: toNumber(record.hours),
    reason: record.reason ?? undefined,
    status: record.status,
    healthStatus: record.healthStatus ?? undefined,
    approverOrgId: record.approverOrgId ?? undefined,
    approverUserId: record.approverUserId ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    attachments: record.attachments?.map(mapPrismaAbsenceAttachmentToDomain) ?? undefined,
    returnToWork: record.returnRecord
      ? mapPrismaReturnRecordToDomain(record.returnRecord)
      : undefined,
    deletionAudit: record.deletionAudit
      ? mapPrismaDeletionAuditToDomain(record.deletionAudit)
      : undefined,
    deletedAt: record.deletedAt ?? undefined,
    deletedByUserId: record.deletedByUserId ?? undefined,
    deletionReason: record.deletionReason ?? undefined,
  };
}

export function mapDomainUnplannedAbsenceToPrismaCreate(
  input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt'>,
): UnplannedAbsenceCreatePayload {
  return {
    orgId: input.orgId,
    userId: input.userId,
    typeId: input.typeId,
    startDate: input.startDate,
    endDate: input.endDate,
    hours: toNumber(input.hours),
    reason: input.reason ?? null,
    status: input.status,
    healthStatus: input.healthStatus ?? null,
    approverOrgId: input.approverOrgId ?? null,
    approverUserId: input.approverUserId ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: toPrismaInputJson(input.metadata),
    deletionReason: input.deletionReason ?? undefined,
    deletedAt: input.deletedAt ?? undefined,
    deletedByUserId: input.deletedByUserId ?? undefined,
  };
}

export function mapDomainUnplannedAbsenceToPrismaUpdate(
  updates: Partial<
    Pick<
      UnplannedAbsence,
      | 'status'
      | 'reason'
      | 'healthStatus'
      | 'approverOrgId'
      | 'approverUserId'
      | 'dataClassification'
      | 'residencyTag'
      | 'metadata'
      | 'startDate'
      | 'endDate'
      | 'hours'
      | 'deletionReason'
      | 'deletedAt'
      | 'deletedByUserId'
    >
  >,
): UnplannedAbsenceUpdatePayload {
  return {
    status: updates.status,
    reason: updates.reason ?? undefined,
    healthStatus: updates.healthStatus ?? undefined,
    approverOrgId: updates.approverOrgId ?? undefined,
    approverUserId: updates.approverUserId ?? undefined,
    dataClassification: updates.dataClassification,
    residencyTag: updates.residencyTag,
    metadata: toPrismaInputJson(updates.metadata),
    startDate: updates.startDate,
    endDate: updates.endDate,
    hours: updates.hours === undefined ? undefined : toNumber(updates.hours),
    deletionReason: updates.deletionReason ?? undefined,
    deletedAt: updates.deletedAt ?? undefined,
    deletedByUserId: updates.deletedByUserId ?? undefined,
  };
}

function mapPrismaAbsenceAttachmentToDomain(record: AbsenceAttachmentRecord): AbsenceAttachment {
  return {
    id: record.id,
    orgId: record.orgId,
    absenceId: record.absenceId,
    fileName: record.fileName,
    storageKey: record.storageKey,
    contentType: record.contentType,
    fileSize: record.fileSize,
    checksum: record.checksum ?? undefined,
    uploadedByUserId: record.uploadedByUserId,
    uploadedAt: record.uploadedAt,
    metadata: record.metadata ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
  };
}

function mapPrismaReturnRecordToDomain(record: AbsenceReturnRecord): ReturnToWorkRecord {
  return {
    orgId: record.orgId,
    absenceId: record.absenceId,
    returnDate: record.returnDate,
    comments: record.comments ?? undefined,
    submittedByUserId: record.submittedByUserId,
    submittedAt: record.submittedAt,
    metadata: record.metadata ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
  };
}

function mapPrismaDeletionAuditToDomain(
  record: AbsenceDeletionAuditRecord,
): AbsenceDeletionAuditEntry {
  return {
    orgId: record.orgId,
    absenceId: record.absenceId,
    reason: record.reason,
    deletedByUserId: record.deletedByUserId,
    deletedAt: record.deletedAt,
    metadata: record.metadata ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
  };
}
