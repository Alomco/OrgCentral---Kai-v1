import type {
  PrismaDecimal,
  PrismaHealthStatus,
  PrismaJsonValue,
  DataClassificationLevel,
  DataResidencyZone,
} from '@/server/types/prisma';
import type {
  HRNotificationDTO,
  HRNotificationPriorityCode,
  HRNotificationTypeCode,
} from './hr/notifications';

export interface AbsenceTypeConfig {
  id: string;
  orgId: string;
  key: string;
  label: string;
  tracksBalance: boolean;
  isActive: boolean;
  metadata?: PrismaJsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceSettings {
  orgId: string;
  hoursInWorkDay: PrismaDecimal | number;
  roundingRule?: string | null;
  metadata?: PrismaJsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnplannedAbsence {
  id: string;
  orgId: string;
  userId: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  hours: PrismaDecimal | number;
  reason?: string | null;
  status: 'REPORTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
  healthStatus?: PrismaHealthStatus | null;
  approverOrgId?: string | null;
  approverUserId?: string | null;
  metadata?: PrismaJsonValue;
  attachments?: AbsenceAttachment[] | null;
  returnToWork?: ReturnToWorkRecord | null;
  deletionAudit?: AbsenceDeletionAuditEntry | null;
  deletionReason?: string | null;
  deletedAt?: Date | null;
  deletedByUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  createdAt: Date;
  updatedAt: Date;
}

export interface AbsenceAttachment {
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
  metadata?: PrismaJsonValue;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
}

export interface AbsenceAttachmentInput
  extends Omit<AbsenceAttachment, 'id' | 'uploadedAt'> {
  uploadedAt?: Date;
}

export interface ReturnToWorkRecord {
  orgId: string;
  absenceId: string;
  returnDate: Date;
  comments?: string | null;
  submittedByUserId: string;
  submittedAt: Date;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaJsonValue;
}

export interface ReturnToWorkRecordInput
  extends Omit<ReturnToWorkRecord, 'submittedAt'> {
  submittedAt?: Date;
}

export interface AbsenceDeletionAuditEntry {
  orgId: string;
  absenceId: string;
  reason: string;
  deletedByUserId: string;
  deletedAt: Date;
  metadata?: PrismaJsonValue;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
}

export interface TimeEntry {
  id: string;
  orgId: string;
  userId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date | null;
  totalHours?: PrismaDecimal | number | null;
  breakDuration?: PrismaDecimal | number | null;
  project?: string | null;
  tasks?: PrismaJsonValue;
  notes?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  approvedByOrgId?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaJsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface HRPolicy {
  id: string;
  orgId: string;
  title: string;
  content: string;
  category:
  | 'HR_POLICIES'
  | 'CODE_OF_CONDUCT'
  | 'HEALTH_SAFETY'
  | 'IT_SECURITY'
  | 'BENEFITS'
  | 'PROCEDURES'
  | 'COMPLIANCE'
  | 'OTHER';
  version: string;
  effectiveDate: Date;
  expiryDate?: Date | null;
  applicableRoles?: PrismaJsonValue;
  applicableDepartments?: PrismaJsonValue;
  requiresAcknowledgment: boolean;
  status: string;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaJsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface HRPolicyListItem {
  id: string;
  orgId: string;
  title: string;
  category:
  | 'HR_POLICIES'
  | 'CODE_OF_CONDUCT'
  | 'HEALTH_SAFETY'
  | 'IT_SECURITY'
  | 'BENEFITS'
  | 'PROCEDURES'
  | 'COMPLIANCE'
  | 'OTHER';
  version: string;
  effectiveDate: Date;
  expiryDate?: Date | null;
  requiresAcknowledgment: boolean;
  status: string;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyAcknowledgment {
  id: string;
  orgId: string;
  userId: string;
  policyId: string;
  version: string;
  acknowledgedAt: Date;
  ipAddress?: string | null;
  metadata?: PrismaJsonValue;
}

export type HRNotification = HRNotificationDTO;
export type NotificationType = HRNotificationTypeCode;
export type NotificationPriority = HRNotificationPriorityCode;

export interface HRSettings {
  orgId: string;
  leaveTypes?: PrismaJsonValue;
  workingHours?: PrismaJsonValue;
  approvalWorkflows?: PrismaJsonValue;
  overtimePolicy?: PrismaJsonValue;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: PrismaJsonValue;
  createdAt: Date;
  updatedAt: Date;
}
