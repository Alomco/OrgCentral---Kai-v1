import type { TenantScopedRecord } from '@/server/types/repository-authorization';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

const CLASSIFICATION_RANK: Record<DataClassificationLevel, number> = {
    OFFICIAL: 1,
    OFFICIAL_SENSITIVE: 2,
    SECRET: 3,
    TOP_SECRET: 4,
};

export interface ClassificationResidencyInfo {
    readonly dataClassification?: DataClassificationLevel | null;
    readonly dataResidency?: DataResidencyZone | null;
}

export type ScopedRecord = TenantScopedRecord & Partial<ClassificationResidencyInfo>;

export function isClassificationCompliant(
    contextClassification: DataClassificationLevel,
    recordClassification: DataClassificationLevel,
): boolean {
    return CLASSIFICATION_RANK[contextClassification] >= CLASSIFICATION_RANK[recordClassification];
}
