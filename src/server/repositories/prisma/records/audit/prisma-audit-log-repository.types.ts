import type { Prisma, AuditEventType } from '@prisma/client';

export interface AuditLogFilters {
    orgId?: string;
    userId?: string;
    eventType?: AuditEventType;
    action?: string;
    resource?: string;
    dataSubjectId?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export type AuditLogCreationData = Prisma.AuditLogUncheckedCreateInput;

export type AuditLogUpdateData = Prisma.AuditLogUncheckedUpdateInput;
