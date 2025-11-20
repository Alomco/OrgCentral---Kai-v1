import type { Prisma } from '@prisma/client';

export interface EventOutboxFilters {
    orgId?: string;
    eventType?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
}

export interface EventOutboxCreationData {
    orgId: string;
    eventType: string;
    payload: Record<string, Prisma.JsonValue> | Prisma.InputJsonValue;
    status?: string;
}

export interface EventOutboxUpdateData {
    status?: string;
    error?: Prisma.InputJsonValue | null;
    processedAt?: Date;
    maxRetries?: number;
    retryCount?: number;
}
