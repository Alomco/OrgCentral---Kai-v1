import type { Prisma, $Enums } from '@prisma/client';

type JsonValue = Prisma.JsonValue;

// Performance review domain aligned to Prisma schema
export type PerformanceReview = {
  id: string;
  orgId: string;
  userId: string;
  reviewerOrgId: string;
  reviewerUserId: string;
  reviewPeriod: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  status: string;
  overallRating?: number | null;
  goalsMet?: JsonValue;
  developmentPlan?: JsonValue;
  reviewerNotes?: string | null;
  employeeResponse?: string | null;
  metadata?: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

// Training record domain aligned to Prisma schema
export type TrainingRecord = {
  id: string;
  orgId: string;
  userId: string;
  courseName: string;
  provider: string;
  startDate: Date;
  endDate?: Date | null;
  status: string;
  certificate?: string | null;
  competency?: JsonValue;
  cost?: number | null;
  approved: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  metadata?: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

// Employee profile domain aligned to Prisma schema
export type EmployeeProfile = {
  id: string;
  orgId: string;
  userId: string;
  employeeNumber: string;
  jobTitle?: string | null;
  employmentType: $Enums.EmploymentType;
  startDate?: Date | null;
  endDate?: Date | null;
  managerOrgId?: string | null;
  managerUserId?: string | null;
  annualSalary?: number | null;
  hourlyRate?: number | null;
  costCenter?: string | null;
  location?: JsonValue;
  niNumber?: string | null;
  emergencyContact?: JsonValue;
  nextOfKin?: JsonValue;
  healthStatus: $Enums.HealthStatus;
  workPermit?: JsonValue;
  bankDetails?: JsonValue;
  metadata?: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

// Employment contract domain aligned to Prisma schema
export type EmploymentContract = {
  id: string;
  orgId: string;
  userId: string;
  contractType: $Enums.ContractType;
  startDate: Date;
  endDate?: Date | null;
  jobTitle: string;
  departmentId?: string | null;
  location?: string | null;
  probationEndDate?: Date | null;
  furloughStartDate?: Date | null;
  furloughEndDate?: Date | null;
  workingPattern?: JsonValue | null;
  benefits?: JsonValue | null;
  terminationReason?: string | null;
  terminationNotes?: string | null;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

// Security event domain aligned to Prisma schema
export type SecurityEvent = {
  id: string;
  orgId?: string | null;
  userId?: string | null;
  eventType: string;
  severity: string;
  description: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  additionalInfo?: JsonValue;
  resolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  createdAt: Date;
};

// User session domain aligned to Prisma schema
export type UserSession = {
  id: string;
  userId: string;
  sessionId: string;
  status: $Enums.SessionStatus;
  ipAddress?: string | null;
  userAgent?: string | null;
  startedAt: Date;
  expiresAt: Date;
  lastAccess: Date;
  revokedAt?: Date | null;
  metadata?: JsonValue;
};

// Department domain aligned to Prisma schema
export type Department = {
  id: string;
  orgId: string;
  name: string;
  path?: string | null;
  leaderOrgId?: string | null;
  leaderUserId?: string | null;
  businessUnit?: string | null;
  costCenter?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Integration config domain aligned to Prisma schema
export type IntegrationConfig = {
  id: string;
  orgId: string;
  provider: string;
  credentials: JsonValue;
  settings: JsonValue;
  active: boolean;
  compliance?: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

// Notification preference domain aligned to Prisma schema
export type NotificationPreference = {
  id: string;
  orgId: string;
  userId: string;
  channel: $Enums.NotificationChannel;
  enabled: boolean;
  quietHours?: JsonValue;
  metadata?: JsonValue;
  updatedAt: Date;
};

// Role domain aligned to Prisma schema
export type Role = {
  id: string;
  orgId: string;
  name: string;
  description?: string | null;
  scope: $Enums.RoleScope;
  permissions: JsonValue;
  createdAt: Date;
  updatedAt: Date;
};

// User domain aligned to Prisma schema
export type User = {
  id: string;
  email: string;
  displayName?: string | null;
  status: $Enums.MembershipStatus;
  authProvider: string;
  lastLoginAt?: Date | null;
  failedLoginCount: number;
  lockedUntil?: Date | null;
  lastPasswordChange: Date;
  createdAt: Date;
  updatedAt: Date;
};
