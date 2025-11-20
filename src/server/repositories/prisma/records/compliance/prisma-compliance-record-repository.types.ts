import type { Prisma } from '@prisma/client';

export interface ComplianceRecordFilters {
    orgId?: string;
    complianceType?: string;
    status?: string;
    priority?: number;
    submittedByOrgId?: string;
    submittedByUserId?: string;
    assignedToUserId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface ComplianceRecordCreationData {
    orgId: string;
    complianceType: string;
    referenceNumber: string;
    status?: string;
    title: string;
    description: string;
    assignedToOrgId?: string;
    assignedToUserId?: string;
    priority?: number;
    dueDate?: Date;
    submittedByOrgId?: string;
    submittedByUserId?: string;
    submittedAt?: Date;
    escalationDate?: Date;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}

export interface ComplianceRecordUpdateData {
    status?: string;
    assignedToOrgId?: string;
    assignedToUserId?: string;
    priority?: number;
    dueDate?: Date;
    completedAt?: Date;
    responseDate?: Date;
    escalationDate?: Date;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}
