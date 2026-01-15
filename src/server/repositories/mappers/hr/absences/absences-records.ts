import type {
  DataClassificationLevel,
  DataResidencyZone,
  PrismaDecimal,
  PrismaInputJsonValue,
  PrismaJsonValue,
  PrismaNullableJsonNullValueInput,
} from '@/server/types/prisma';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface AbsenceTypeConfigRecord {
  id: string;
  orgId: string;
  key: string;
  label: string;
  tracksBalance: boolean;
  isActive: boolean;
  metadata?: PrismaJsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceTypeConfigCreatePayload {
  orgId: string;
  key: string;
  label: string;
  tracksBalance: boolean;
  isActive: boolean;
  metadata?: PrismaInputJsonValue | PrismaNullableJsonNullValueInput;
}

export interface AbsenceTypeConfigUpdatePayload {
  label?: string;
  tracksBalance?: boolean;
  isActive?: boolean;
  metadata?: PrismaInputJsonValue | PrismaNullableJsonNullValueInput;
}

export interface AbsenceSettingsRecord {
  orgId: string;
  hoursInWorkDay: PrismaDecimal;
  roundingRule?: string | null;
  metadata?: PrismaJsonValue | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceSettingsCreateArguments {
  orgId: string;
  hoursInWorkDay: number;
  roundingRule: string | null;
  metadata?: PrismaInputJsonValue | PrismaNullableJsonNullValueInput;
}

export interface AbsenceAttachmentRecord {
  id: string;
  orgId: string;
  absenceId: string;
  fileName: string;
  storageKey: string;
  contentType: string;
  fileSize: number;
  checksum?: string | null;
  uploadedByUserId: string;
  uploadedAt: Date;
  metadata?: PrismaJsonValue | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
}

export interface AbsenceReturnRecord {
  orgId: string;
  absenceId: string;
  returnDate: Date;
  comments?: string | null;
  submittedByUserId: string;
  submittedAt: Date;
  metadata?: PrismaJsonValue | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
}

export interface AbsenceDeletionAuditRecord {
  orgId: string;
  absenceId: string;
  reason: string;
  deletedByUserId: string;
  deletedAt: Date;
  metadata?: PrismaJsonValue | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
}

export interface UnplannedAbsenceRecord {
  id: string;
  orgId: string;
  userId: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  hours: PrismaDecimal;
  reason?: string | null;
  status: UnplannedAbsence['status'];
  healthStatus?: UnplannedAbsence['healthStatus'];
  approverOrgId?: string | null;
  approverUserId?: string | null;
  metadata?: PrismaJsonValue | null;
  attachments?: AbsenceAttachmentRecord[] | null;
  returnRecord?: AbsenceReturnRecord | null;
  deletionAudit?: AbsenceDeletionAuditRecord | null;
  deletionReason?: string | null;
  deletedAt?: Date | null;
  deletedByUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnplannedAbsenceCreatePayload {
  orgId: string;
  userId: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  hours: number;
  reason?: string | null;
  status: UnplannedAbsence['status'];
  healthStatus?: UnplannedAbsence['healthStatus'];
  approverOrgId?: string | null;
  approverUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaInputJsonValue | PrismaNullableJsonNullValueInput;
  deletionReason?: string | null;
  deletedAt?: Date | null;
  deletedByUserId?: string | null;
}

type UnplannedAbsenceUpdateFields = Partial<
  Pick<
    UnplannedAbsence,
    | 'status'
    | 'reason'
    | 'healthStatus'
    | 'approverOrgId'
    | 'approverUserId'
    | 'dataClassification'
    | 'residencyTag'
    | 'startDate'
    | 'endDate'
    | 'hours'
    | 'deletionReason'
    | 'deletedAt'
    | 'deletedByUserId'
  >
>;

export type UnplannedAbsenceUpdatePayload = UnplannedAbsenceUpdateFields & {
  metadata?: PrismaInputJsonValue | PrismaNullableJsonNullValueInput;
};
