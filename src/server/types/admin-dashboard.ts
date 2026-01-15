import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface AdminDashboardKpis {
    activeMembers: number;
    pendingInvites: number;
    totalRoles: number;
    complianceScore: number | null;
}

export type GovernanceAlertSeverity = 'low' | 'medium' | 'high';

export interface GovernanceAlert {
    id: string;
    title: string;
    description: string;
    severity: GovernanceAlertSeverity;
    actionLabel?: string;
    actionHref?: string;
}

export type SecurityEventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface SecurityEventSummary {
    id: string;
    title: string;
    description: string;
    severity: SecurityEventSeverity;
    occurredAt: Date;
}

export type PendingApprovalType = 'compliance' | 'membership' | 'role';

export interface PendingApprovalSummary {
    id: string;
    title: string;
    type: PendingApprovalType;
    href: string;
    dueDate?: Date | null;
}

export type TenantHealthStatus = 'healthy' | 'attention' | 'critical';

export interface TenantHealthIndicator {
    label: string;
    value: string;
    description?: string;
    status: TenantHealthStatus;
}

export interface TenantHealthOverview {
    orgId: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    status: TenantHealthStatus;
    indicators: TenantHealthIndicator[];
}
