import type { Prisma } from '@prisma/client';

export interface StatutoryReportFilters {
    orgId?: string;
    reportType?: string;
    period?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface StatutoryReportCreationData {
    orgId: string;
    reportType: string;
    period: string;
    dueDate: Date;
    submittedByOrgId?: string;
    submittedByUserId?: string;
    status?: string;
    fileName?: string;
    fileSize?: number;
    checksum?: string;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}

export interface StatutoryReportUpdateData {
    status?: string;
    fileName?: string;
    fileSize?: number;
    checksum?: string;
    submittedByOrgId?: string;
    submittedByUserId?: string;
    submittedAt?: Date;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}
