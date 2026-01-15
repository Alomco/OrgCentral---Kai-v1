import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type {
  EnhancedSecurityEvent,
  SecurityAlert,
  DlpPolicy,
  DlpScanResult,
  SecurityMetrics,
  SecurityComplianceReport,
  SecurityFinding,
} from '@/server/types/enhanced-security-types';

export interface ISecurityEventRepository {
  createEvent(context: RepositoryAuthorizationContext, event: Omit<EnhancedSecurityEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<EnhancedSecurityEvent>;
  getEvent(context: RepositoryAuthorizationContext, eventId: string): Promise<EnhancedSecurityEvent | null>;
  getEventsByOrg(context: RepositoryAuthorizationContext, filters?: {
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    eventType?: string;
    limit?: number;
    offset?: number;
  }): Promise<EnhancedSecurityEvent[]>;
  countEventsByOrg(context: RepositoryAuthorizationContext, filters?: {
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    eventType?: string;
  }): Promise<number>;
}

export interface ISecurityAlertRepository {
  createAlert(context: RepositoryAuthorizationContext, alert: Omit<SecurityAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<SecurityAlert>;
  getAlert(context: RepositoryAuthorizationContext, alertId: string): Promise<SecurityAlert | null>;
  getAlertsByOrg(context: RepositoryAuthorizationContext, filters?: {
    status?: string;
    priority?: string;
    severity?: string;
    assignedTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<SecurityAlert[]>;
  updateAlert(context: RepositoryAuthorizationContext, alertId: string, updates: Partial<Omit<SecurityAlert, 'id' | 'orgId' | 'createdAt'>>): Promise<void>;
  countAlertsByOrg(context: RepositoryAuthorizationContext, filters?: {
    status?: string;
    priority?: string;
    severity?: string;
    assignedTo?: string;
  }): Promise<number>;
}

export interface IDlpPolicyRepository {
  createPolicy(context: RepositoryAuthorizationContext, policy: Omit<DlpPolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<DlpPolicy>;
  getPolicy(context: RepositoryAuthorizationContext, policyId: string): Promise<DlpPolicy | null>;
  getPoliciesByOrg(context: RepositoryAuthorizationContext): Promise<DlpPolicy[]>;
  updatePolicy(context: RepositoryAuthorizationContext, policyId: string, updates: Partial<Omit<DlpPolicy, 'id' | 'orgId' | 'createdAt'>>): Promise<void>;
  deletePolicy(context: RepositoryAuthorizationContext, policyId: string): Promise<void>;
  getActivePoliciesByOrg(context: RepositoryAuthorizationContext): Promise<DlpPolicy[]>;
}

export interface IDlpScanResultRepository {
  createScanResult(context: RepositoryAuthorizationContext, result: Omit<DlpScanResult, 'id'>): Promise<DlpScanResult>;
  getScanResult(context: RepositoryAuthorizationContext, scanResultId: string): Promise<DlpScanResult | null>;
  getScanResultsByOrg(context: RepositoryAuthorizationContext, filters?: {
    scanType?: string;
    startDate?: Date;
    endDate?: Date;
    actionTaken?: string;
    limit?: number;
    offset?: number;
  }): Promise<DlpScanResult[]>;
  countScanResultsByOrg(context: RepositoryAuthorizationContext, filters?: {
    scanType?: string;
    startDate?: Date;
    endDate?: Date;
    actionTaken?: string;
  }): Promise<number>;
}

export interface ISecurityMetricsRepository {
  createMetrics(context: RepositoryAuthorizationContext, metrics: Omit<SecurityMetrics, 'id'>): Promise<SecurityMetrics>;
  getMetrics(context: RepositoryAuthorizationContext, periodStart: Date, periodEnd: Date): Promise<SecurityMetrics | null>;
  getLatestMetrics(context: RepositoryAuthorizationContext): Promise<SecurityMetrics | null>;
  updateMetrics(context: RepositoryAuthorizationContext, periodStart: Date, periodEnd: Date, updates: Partial<SecurityMetrics>): Promise<void>;
}

export interface ISecurityComplianceRepository {
  createReport(context: RepositoryAuthorizationContext, report: Omit<SecurityComplianceReport, 'id'>): Promise<SecurityComplianceReport>;
  getReport(context: RepositoryAuthorizationContext, reportDate: Date): Promise<SecurityComplianceReport | null>;
  getLatestReport(context: RepositoryAuthorizationContext): Promise<SecurityComplianceReport | null>;
  updateReport(context: RepositoryAuthorizationContext, reportDate: Date, updates: Partial<SecurityComplianceReport>): Promise<void>;
  listFindings?(context: RepositoryAuthorizationContext): Promise<SecurityFinding[]>;
}