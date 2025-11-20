import type { Prisma } from '@prisma/client';

export interface DataSubjectRightFilters {
    orgId?: string;
    userId?: string;
    rightType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface DataSubjectRightCreationData {
    orgId: string;
    userId?: string;
    rightType: string;
    status?: string;
    requestDate?: Date;
    dueDate: Date;
    dataSubjectInfo?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
    response?: string;
    responseFrom?: string;
    notes?: string;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}

export interface DataSubjectRightUpdateData {
    status?: string;
    completedAt?: Date;
    responseDate?: Date;
    response?: string;
    responseFrom?: string;
    notes?: string;
    metadata?: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
}
