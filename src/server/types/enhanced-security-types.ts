import type { PrismaJsonValue } from '@/server/types/prisma';
import { z } from 'zod';
import type { SecurityEvent } from './hr-types';
import type { OrgPermissionMap, OrgRoleKey } from '@/server/security/access-control';
import type { RoleScope } from '@/server/types/prisma';
import type { TenantScope, DataResidencyZone, DataClassificationLevel, OrgId } from './tenant';

export type DlpScanType =
  | 'document'
  | 'email'
  | 'api_request'
  | 'file_upload'
  | 'database_query'
  | 'api_call'
  | 'upload'
  | 'download';

// Enhanced security event types with stricter validation
export interface EnhancedSecurityEvent extends SecurityEvent {
  tenantScope: TenantScope;
  dataClassification: DataClassificationLevel;
  dataResidency: DataResidencyZone;
  resourceId?: string;
  resourceType?: string;
  metadata?: PrismaJsonValue;
  piiDetected?: boolean;
  piiAccessed?: boolean;
  dataBreachPotential?: boolean;
  remediationSteps?: string[];
}

export interface SecurityAuditTrail {
  eventId: string;
  timestamp: Date;
  userId: string;
  orgId: OrgId;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  outcome: 'success' | 'failure' | 'blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  piiAccessed?: boolean;
  dataClassification: DataClassificationLevel;
  dataResidency: DataResidencyZone;
  metadata?: PrismaJsonValue;
}

export interface SecurityComplianceReport {
  orgId: OrgId;
  reportDate: Date;
  complianceStatus: 'pass' | 'warning' | 'fail';
  findings: SecurityFinding[];
  recommendations: string[];
  nextAuditDate: Date;
}

export interface SecurityFinding {
  id: string;
  category: 'data_protection' | 'access_control' | 'network_security' | 'incident_response';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  remediationDueDate: Date;
  evidence: string[];
}

// Enhanced permission types with data classification awareness
export interface ClassificationAwarePermission {
  resource: string;
  actions: string[];
  requiredClassification: DataClassificationLevel;
  allowedResidencies: DataResidencyZone[];
  requiresMfa?: boolean;
  auditRequired: boolean;
}

export interface SecureResourceAccessRequest {
  userId: string;
  orgId: OrgId;
  resourceType: string;
  resourceId?: string;
  action: string;
  dataClassification: DataClassificationLevel;
  dataResidency: DataResidencyZone;
  justification?: string;
  requiresApproval?: boolean;
  ipAddress: string;
  userAgent: string;
}

export interface SecureResourceAccessResponse {
  granted: boolean;
  reason?: string;
  requiresAdditionalAuth?: boolean;
  requiresJustification?: boolean;
  auditTrailId: string;
  sessionTimeout: number; // in minutes
}

// Enhanced security validation schemas
export const EnhancedSecurityEventSchema = z.object({
  orgId: z.uuid(),
  eventType: z.string().min(1).max(100),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string().min(10).max(1000),
  ipAddress: z.string().min(3).max(45).optional().nullable(),
  userAgent: z.string().min(1).max(500).optional().nullable(),
  resourceId: z.uuid().optional().nullable(),
  piiDetected: z.boolean().optional(),
  dataBreachPotential: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const SecureResourceAccessRequestSchema = z.object({
  userId: z.uuid(),
  orgId: z.uuid(),
  resourceType: z.string().min(1).max(100),
  resourceId: z.uuid().optional().nullable(),
  action: z.string().min(1).max(50),
  dataClassification: z.enum(['OFFICIAL', 'OFFICIAL_SENSITIVE', 'SECRET', 'TOP_SECRET']),
  dataResidency: z.enum(['UK_ONLY', 'UK_AND_EEA', 'GLOBAL_RESTRICTED']),
  justification: z.string().min(10).max(500).optional(),
  ipAddress: z.string().min(3).max(45),
  userAgent: z.string().min(1).max(500),
});

export type EnhancedSecurityEventInput = z.infer<typeof EnhancedSecurityEventSchema>;
export type SecureResourceAccessRequestInput = z.infer<typeof SecureResourceAccessRequestSchema>;

// Enhanced security context with full tenant isolation
export interface EnhancedSecurityContext extends TenantScope {
  userId: string;
  correlationId?: string;
  roleKey?: OrgRoleKey | 'custom';
  roleName?: string | null;
  roleId?: string | null;
  roleScope?: RoleScope | null;
  sessionId?: string;
  roles?: string[];
  permissions: OrgPermissionMap;
  mfaVerified?: boolean;
  ipAddress?: string;
  userAgent?: string;
  authenticatedAt?: Date;
  sessionExpiresAt?: Date;
  lastActivityAt?: Date;
}

// Data Loss Prevention (DLP) types
export interface DlpPolicy {
  id: string;
  orgId: OrgId;
  name: string;
  description: string;
  enabled: boolean;
  rules: DlpRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DlpRule {
  id: string;
  pattern: string; // regex pattern to detect sensitive data
  dataType: 'credit_card' | 'ssn' | 'email' | 'phone' | 'custom';
  action: 'block' | 'alert' | 'quarantine';
  severity: 'low' | 'medium' | 'high' | 'critical';
  exceptions: string[]; // org-specific exceptions
}

export interface DlpScanResult {
  id: string;
  orgId: OrgId;
  scanType: DlpScanType;
  resourceId: string;
  resourceType: string;
  findings: DlpFinding[];
  actionTaken: 'allowed' | 'blocked' | 'quarantined' | 'reported';
  scannedAt: Date;
  scannerUserId?: string;
}

export interface DlpFinding {
  id: string;
  dataType: string;
  confidence: number; // 0-100
  location: string; // where in the resource the data was found
  context: string; // surrounding text/context
  remediation: 'removed' | 'masked' | 'flagged' | 'reported' | 'blocked' | 'quarantined';
}

// Enhanced security monitoring types
export interface SecurityAlert {
  id: string;
  orgId: OrgId;
  alertType: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  metadata?: PrismaJsonValue;
}

export interface SecurityMetrics {
  orgId: OrgId;
  periodStart: Date;
  periodEnd: Date;
  totalEvents: number;
  securityEvents: number;
  incidents: number;
  alertsGenerated: number;
  alertsResolved: number;
  meanTimeToDetection: number; // in minutes
  meanTimeToResolution: number; // in minutes
  complianceScore: number; // 0-100
  dlpViolations: number;
  accessViolations: number;
  dataBreachAttempts: number;
  successfulPhishingSimulations?: number;
  securityTrainingCompletionRate?: number;
}