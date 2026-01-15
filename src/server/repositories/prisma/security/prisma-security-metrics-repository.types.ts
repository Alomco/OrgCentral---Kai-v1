import type { SecurityMetrics } from '@/server/types/enhanced-security-types';

export interface SecurityMetricsRecord extends SecurityMetrics {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SecurityMetricsCreateInput {
  orgId: string;
  periodStart: Date;
  periodEnd: Date;
  totalEvents: number;
  securityEvents: number;
  incidents: number;
  alertsGenerated: number;
  alertsResolved: number;
  meanTimeToDetection: number;
  meanTimeToResolution: number;
  complianceScore: number;
  dlpViolations: number;
  accessViolations: number;
  dataBreachAttempts: number;
  successfulPhishingSimulations?: number;
  securityTrainingCompletionRate?: number;
}

export interface SecurityMetricsUpdateInput {
  totalEvents?: number;
  securityEvents?: number;
  incidents?: number;
  alertsGenerated?: number;
  alertsResolved?: number;
  meanTimeToDetection?: number;
  meanTimeToResolution?: number;
  complianceScore?: number;
  dlpViolations?: number;
  accessViolations?: number;
  dataBreachAttempts?: number;
  successfulPhishingSimulations?: number;
  securityTrainingCompletionRate?: number;
}

export interface SecurityMetricsDelegate {
  upsert: (args: {
    where: {
      orgId_periodStart_periodEnd: { orgId: string; periodStart: Date; periodEnd: Date };
    };
    update: SecurityMetricsUpdateInput & { updatedAt: Date };
    create: SecurityMetricsCreateInput & { createdAt: Date; updatedAt: Date };
  }) => Promise<SecurityMetricsRecord>;
  findUnique: (args: {
    where: {
      orgId_periodStart_periodEnd: { orgId: string; periodStart: Date; periodEnd: Date };
    };
  }) => Promise<SecurityMetricsRecord | null>;
  findFirst: (args: { where: { orgId: string }; orderBy: { periodEnd: 'desc' } }) => Promise<SecurityMetricsRecord | null>;
  update: (args: {
    where: {
      orgId_periodStart_periodEnd: { orgId: string; periodStart: Date; periodEnd: Date };
    };
    data: SecurityMetricsUpdateInput & { updatedAt: Date };
  }) => Promise<SecurityMetricsRecord>;
}
