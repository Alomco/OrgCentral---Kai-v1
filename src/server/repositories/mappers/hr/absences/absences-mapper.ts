import type {
  AbsenceAttachment as PrismaAbsenceAttachment,
  AbsenceDeletionAudit as PrismaAbsenceDeletionAudit,
  AbsenceReturnRecord as PrismaAbsenceReturnRecord,
  AbsenceSettings as PrismaAbsenceSettings,
  AbsenceTypeConfig as PrismaAbsenceTypeConfig,
  UnplannedAbsence as PrismaUnplannedAbsence,
} from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type {
  AbsenceAttachment,
  AbsenceDeletionAuditEntry,
  AbsenceSettings,
  AbsenceTypeConfig,
  ReturnToWorkRecord,
  UnplannedAbsence,
} from '@/server/types/hr-ops-types';

export function mapPrismaAbsenceTypeConfigToDomain(record: PrismaAbsenceTypeConfig): AbsenceTypeConfig {
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
): Prisma.AbsenceTypeConfigUncheckedCreateInput {
  return {
    orgId: input.orgId,
    key: input.key,
    label: input.label,
    tracksBalance: input.tracksBalance,
    isActive: input.isActive,
    metadata: input.metadata ?? undefined,
  };
}

export function mapDomainAbsenceTypeConfigToPrismaUpdate(
  updates: Partial<Pick<AbsenceTypeConfig, 'label' | 'tracksBalance' | 'isActive' | 'metadata'>>,
): Prisma.AbsenceTypeConfigUncheckedUpdateInput {
  return {
    label: updates.label,
    tracksBalance: updates.tracksBalance,
    isActive: updates.isActive,
    metadata: updates.metadata ?? undefined,
  };
}

export function mapPrismaAbsenceSettingsToDomain(record: PrismaAbsenceSettings): AbsenceSettings {
  return {
    orgId: record.orgId,
    hoursInWorkDay: Number(record.hoursInWorkDay),
    roundingRule: record.roundingRule ?? undefined,
    metadata: record.metadata ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainAbsenceSettingsToPrismaUpsert(
  orgId: string,
  input: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>,
): Prisma.AbsenceSettingsUpsertArgs['create'] {
  return {
    orgId,
    hoursInWorkDay: input.hoursInWorkDay,
    roundingRule: input.roundingRule ?? null,
    metadata: input.metadata ?? undefined,
  };
}

type PrismaUnplannedAbsenceWithRelations = PrismaUnplannedAbsence & {
  attachments?: PrismaAbsenceAttachment[];
  returnRecord?: PrismaAbsenceReturnRecord | null;
  deletionAudit?: PrismaAbsenceDeletionAudit | null;
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
    hours: Number(record.hours),
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
): Prisma.UnplannedAbsenceUncheckedCreateInput {
  return {
    orgId: input.orgId,
    userId: input.userId,
    typeId: input.typeId,
    startDate: input.startDate,
    endDate: input.endDate,
    hours: input.hours,
    reason: input.reason ?? null,
    status: input.status,
    healthStatus: input.healthStatus ?? null,
    approverOrgId: input.approverOrgId ?? null,
    approverUserId: input.approverUserId ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ?? undefined,
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
): Prisma.UnplannedAbsenceUncheckedUpdateInput {
  return {
    status: updates.status,
    reason: updates.reason ?? undefined,
    healthStatus: updates.healthStatus ?? undefined,
    approverOrgId: updates.approverOrgId ?? undefined,
    approverUserId: updates.approverUserId ?? undefined,
    dataClassification: updates.dataClassification,
    residencyTag: updates.residencyTag,
    metadata: updates.metadata ?? undefined,
    startDate: updates.startDate,
    endDate: updates.endDate,
    hours: updates.hours,
    deletionReason: updates.deletionReason ?? undefined,
    deletedAt: updates.deletedAt ?? undefined,
    deletedByUserId: updates.deletedByUserId ?? undefined,
  };
}

function mapPrismaAbsenceAttachmentToDomain(record: PrismaAbsenceAttachment): AbsenceAttachment {
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

function mapPrismaReturnRecordToDomain(record: PrismaAbsenceReturnRecord): ReturnToWorkRecord {
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
  record: PrismaAbsenceDeletionAudit,
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
