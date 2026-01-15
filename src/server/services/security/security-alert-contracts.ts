import type { ISecurityAlertRepository } from '@/server/repositories/contracts/security/enhanced-security-repository-contracts';
import type { OrgAccessInput } from '@/server/security/guards';
import type { SecurityAlert } from '@/server/types/enhanced-security-types';
import type { JsonRecord } from '@/server/types/json';

export interface SecurityAlertServiceDependencies {
    securityAlertRepository: ISecurityAlertRepository;
    guard?: (input: OrgAccessInput) => Promise<unknown>;
}

export interface CreateSecurityAlertInput {
    orgId: string;
    alertType: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo?: string;
    metadata?: JsonRecord;
}

export interface UpdateSecurityAlertInput {
    alertId: string;
    updates: Partial<Omit<SecurityAlert, 'id' | 'orgId' | 'createdAt'>>;
}

export interface ResolveSecurityAlertInput {
    alertId: string;
    resolvedBy: string;
    resolutionNotes?: string;
}

export interface SecurityAlertServiceOptions {
    autoEscalateCriticalAlerts?: boolean;
    notificationEnabled?: boolean;
}
