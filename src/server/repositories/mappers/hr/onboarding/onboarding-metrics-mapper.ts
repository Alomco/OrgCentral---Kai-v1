import type { JsonRecord } from '@/server/types/json';
import { PrismaDecimal, type PrismaDecimal as PrismaDecimalType, type PrismaJsonValue } from '@/server/types/prisma';
import type {
    OnboardingMetricDefinitionRecord,
    OnboardingMetricResultRecord,
} from '@/server/types/hr/onboarding-metrics';

export interface OnboardingMetricDefinitionPrismaRecord {
    id: string;
    orgId: string;
    key: string;
    label: string;
    unit: string | null;
    targetValue: PrismaDecimalType | string | number | null;
    thresholds: PrismaJsonValue | null;
    isActive: boolean;
    metadata: PrismaJsonValue | null;
    dataClassification: OnboardingMetricDefinitionRecord['dataClassification'];
    residencyTag: OnboardingMetricDefinitionRecord['residencyTag'];
    auditSource: string | null;
    correlationId: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface OnboardingMetricResultPrismaRecord {
    id: string;
    orgId: string;
    employeeId: string;
    metricId: string;
    value: PrismaDecimalType | string | number | null;
    valueText: string | null;
    source: OnboardingMetricResultRecord['source'];
    measuredAt: Date | string;
    metadata: PrismaJsonValue | null;
    dataClassification: OnboardingMetricResultRecord['dataClassification'];
    residencyTag: OnboardingMetricResultRecord['residencyTag'];
    auditSource: string | null;
    correlationId: string | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export function mapOnboardingMetricDefinitionRecordToDomain(
    record: OnboardingMetricDefinitionPrismaRecord,
): OnboardingMetricDefinitionRecord {
    const targetValue = normalizeDecimal(record.targetValue);
    return {
        id: record.id,
        orgId: record.orgId,
        key: record.key,
        label: record.label,
        unit: record.unit ?? undefined,
        targetValue: targetValue ?? undefined,
        thresholds: (record.thresholds ?? undefined) as JsonRecord | null | undefined,
        isActive: record.isActive,
        metadata: (record.metadata ?? undefined) as JsonRecord | null | undefined,
        dataClassification: record.dataClassification,
        residencyTag: record.residencyTag,
        auditSource: record.auditSource ?? undefined,
        correlationId: record.correlationId ?? undefined,
        createdBy: record.createdBy ?? undefined,
        updatedBy: record.updatedBy ?? undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

export function mapOnboardingMetricResultRecordToDomain(
    record: OnboardingMetricResultPrismaRecord,
): OnboardingMetricResultRecord {
    const value = normalizeDecimal(record.value);
    return {
        id: record.id,
        orgId: record.orgId,
        employeeId: record.employeeId,
        metricId: record.metricId,
        value: value ?? undefined,
        valueText: record.valueText ?? undefined,
        source: record.source,
        measuredAt: record.measuredAt,
        metadata: (record.metadata ?? undefined) as JsonRecord | null | undefined,
        dataClassification: record.dataClassification,
        residencyTag: record.residencyTag,
        auditSource: record.auditSource ?? undefined,
        correlationId: record.correlationId ?? undefined,
        createdBy: record.createdBy ?? undefined,
        updatedBy: record.updatedBy ?? undefined,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

function normalizeDecimal(value: PrismaDecimalType | string | number | null | undefined): string | number | null | undefined {
    if (value === null || value === undefined) {
        return value;
    }
    if (value instanceof PrismaDecimal) {
        return value.toString();
    }
    return value;
}
