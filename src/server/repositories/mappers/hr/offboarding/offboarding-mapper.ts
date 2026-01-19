import type { PrismaJsonValue } from '@/server/types/prisma';
import type { JsonRecord } from '@/server/types/json';
import type { OffboardingCreateInput, OffboardingUpdateInput, OffboardingRecord } from '@/server/types/hr/offboarding-types';

export interface OffboardingRecordDatabase {
    id: string;
    orgId: string;
    employeeId: string;
    initiatedByUserId: string;
    checklistInstanceId?: string | null;
    reason: string;
    status: OffboardingRecord['status'];
    startedAt: Date | string;
    completedAt?: Date | string | null;
    canceledAt?: Date | string | null;
    metadata?: PrismaJsonValue | null;
    dataClassification?: OffboardingRecord['dataClassification'];
    residencyTag?: OffboardingRecord['dataResidency'];
    auditSource?: string | null;
    correlationId?: string | null;
    createdBy?: string | null;
    updatedBy?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export function mapOffboardingRecordToDomain(record: OffboardingRecordDatabase): OffboardingRecord {
    return {
        id: record.id,
        orgId: record.orgId,
        employeeId: record.employeeId,
        initiatedByUserId: record.initiatedByUserId,
        checklistInstanceId: record.checklistInstanceId ?? null,
        reason: record.reason,
        status: record.status,
        startedAt: record.startedAt,
        completedAt: record.completedAt ?? null,
        canceledAt: record.canceledAt ?? null,
        metadata: normalizeMetadata(record.metadata),
        dataClassification: record.dataClassification,
        dataResidency: record.residencyTag,
        auditSource: record.auditSource ?? null,
        correlationId: record.correlationId ?? null,
        createdBy: record.createdBy ?? null,
        updatedBy: record.updatedBy ?? null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

function normalizeMetadata(metadata?: PrismaJsonValue | null): JsonRecord | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return null;
    }
    return metadata as JsonRecord;
}

export function mapOffboardingCreateToDatabase(
    input: OffboardingCreateInput,
): Partial<OffboardingRecordDatabase> {
    return {
        orgId: input.orgId,
        employeeId: input.employeeId,
        initiatedByUserId: input.initiatedByUserId,
        checklistInstanceId: input.checklistInstanceId ?? null,
        reason: input.reason,
        metadata: input.metadata as PrismaJsonValue,
        dataClassification: input.dataClassification,
        residencyTag: input.dataResidency,
        auditSource: input.auditSource ?? null,
        correlationId: input.correlationId ?? null,
        createdBy: input.createdBy ?? null,
    };
}

export function mapOffboardingUpdateToDatabase(
    updates: OffboardingUpdateInput,
): Partial<OffboardingRecordDatabase> {
    return {
        status: updates.status,
        completedAt: updates.completedAt ?? null,
        canceledAt: updates.canceledAt ?? null,
        checklistInstanceId: updates.checklistInstanceId ?? null,
        metadata: updates.metadata as PrismaJsonValue,
        updatedBy: updates.updatedBy ?? null,
    };
}
