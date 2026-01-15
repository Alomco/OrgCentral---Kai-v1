import type { JsonRecord } from '@/server/types/json';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export enum IncidentSeverity {
    Low = 'low',
    Medium = 'medium',
    High = 'high',
    Critical = 'critical',
}

export enum IncidentStatus {
    Reported = 'reported',
    Investigating = 'investigating',
    Contained = 'contained',
    Eradicated = 'eradicated',
    Recovered = 'recovered',
    Closed = 'closed',
}

export interface SecurityIncident {
    id: string;
    orgId: string;
    title: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    reporterId: string;
    assignedTo?: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date;
    evidence: string[];
    affectedSystems: string[];
    impactAssessment: string;
    containmentMeasures: string[];
    eradicationSteps: string[];
    recoveryPlan: string[];
    lessonsLearned?: string;
    metadata?: JsonRecord;
}

export interface IncidentResponseStep {
    id: string;
    name: string;
    description: string;
    required: boolean;
    completed: boolean;
    completedAt?: Date;
    completedBy?: string;
    dependencies: string[];
}

export interface IncidentResponseWorkflow {
    id: string;
    name: string;
    description: string;
    severity: IncidentSeverity;
    steps: IncidentResponseStep[];
    escalationContacts: string[];
    notificationChannels: string[];
    autoTriggerConditions: string[];
}

export interface ReportIncidentInput {
    orgId: string;
    title: string;
    description: string;
    severity: IncidentSeverity;
    evidence?: string[];
    affectedSystems?: string[];
    reporterId: string;
    metadata?: JsonRecord;
}

export interface UpdateIncidentInput {
    incidentId: string;
    updates: Partial<Omit<SecurityIncident, 'id' | 'orgId' | 'createdAt' | 'reporterId'>>;
}

export interface AssignIncidentInput {
    incidentId: string;
    assigneeId: string;
    assignedById: string;
}

export interface IncidentResponseServiceOptions {
    enableAutoEscalation?: boolean;
    notificationEnabled?: boolean;
    autoCloseInactiveIncidents?: boolean;
}

export interface IncidentOperationContext {
    auth: RepositoryAuthorizationContext;
    workflows: Map<string, IncidentResponseWorkflow>;
    config: {
        enableAutoEscalation: boolean;
        notificationEnabled: boolean;
    };
}
