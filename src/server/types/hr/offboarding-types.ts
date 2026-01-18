import type { DataClassificationLevel, DataResidencyZone } from '../tenant';

export const OFFBOARDING_STATUS_VALUES = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type OffboardingStatus = typeof OFFBOARDING_STATUS_VALUES[number];

export interface OffboardingRecord {
    id: string;
    orgId: string;
    employeeId: string;
    initiatedByUserId: string;
    checklistInstanceId?: string | null;
    reason: string;
    status: OffboardingStatus;
    startedAt: Date | string;
    completedAt?: Date | string | null;
    canceledAt?: Date | string | null;
    metadata?: Record<string, unknown> | null;
    dataResidency?: DataResidencyZone;
    dataClassification?: DataClassificationLevel;
    auditSource?: string | null;
    correlationId?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface OffboardingCreateInput {
    orgId: string;
    employeeId: string;
    initiatedByUserId: string;
    checklistInstanceId?: string | null;
    reason: string;
    metadata?: Record<string, unknown> | null;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource?: string | null;
    correlationId?: string | null;
    createdBy?: string | null;
}

export interface OffboardingUpdateInput {
    status?: OffboardingStatus;
    completedAt?: Date | null;
    canceledAt?: Date | null;
    checklistInstanceId?: string | null;
    metadata?: Record<string, unknown> | null;
    updatedBy?: string | null;
}
