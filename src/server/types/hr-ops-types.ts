import type { DataClassificationLevel, DataResidencyZone } from '@prisma/client';
import type { Prisma } from '@prisma/client';

export type AbsenceTypeConfig = {
  id: string;
  orgId: string;
  key: string;
  label: string;
  tracksBalance: boolean;
  isActive: boolean;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type AbsenceSettings = {
  orgId: string;
  hoursInWorkDay: Prisma.Decimal | number;
  roundingRule?: string | null;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type UnplannedAbsence = {
  id: string;
  orgId: string;
  userId: string;
  typeId: string;
  startDate: Date;
  endDate: Date;
  hours: Prisma.Decimal | number;
  reason?: string;
  status: 'REPORTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
  healthStatus?: Prisma.HealthStatus | null;
  approverOrgId?: string | null;
  approverUserId?: string | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type TimeEntry = {
  id: string;
  orgId: string;
  userId: string;
  date: Date;
  clockIn: Date;
  clockOut?: Date | null;
  totalHours?: Prisma.Decimal | number | null;
  breakDuration?: Prisma.Decimal | number | null;
  project?: string | null;
  tasks?: Prisma.JsonValue;
  notes?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'APPROVED' | 'REJECTED';
  approvedByOrgId?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type HRPolicy = {
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
  applicableRoles?: Prisma.JsonValue;
  applicableDepartments?: Prisma.JsonValue;
  requiresAcknowledgment: boolean;
  status: string;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

export type PolicyAcknowledgment = {
  id: string;
  orgId: string;
  userId: string;
  policyId: string;
  version: string;
  acknowledgedAt: Date;
  ipAddress?: string | null;
  metadata?: Prisma.JsonValue;
};

export type HRNotification = {
  id: string;
  orgId: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'LEAVE_APPROVAL'
    | 'LEAVE_REJECTION'
    | 'DOCUMENT_EXPIRY'
    | 'POLICY_UPDATE'
    | 'PERFORMANCE_REVIEW'
    | 'SYSTEM_ANNOUNCEMENT'
    | 'COMPLIANCE_REMINDER'
    | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt?: Date | null;
  actionUrl?: string | null;
  actionLabel?: string | null;
  scheduledFor?: Date | null;
  expiresAt?: Date | null;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
};

export type HRSettings = {
  orgId: string;
  leaveTypes?: Prisma.JsonValue;
  workingHours?: Prisma.JsonValue;
  approvalWorkflows?: Prisma.JsonValue;
  overtimePolicy?: Prisma.JsonValue;
  dataClassification: DataClassificationLevel;
  residencyTag: DataResidencyZone;
  metadata?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
};
