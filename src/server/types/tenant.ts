export type Identifier = string;
export type OrgId = Identifier;

import type {
    DataResidencyZone as PrismaDataResidencyZone,
    DataClassificationLevel as PrismaDataClassificationLevel,
} from '@/server/types/prisma';
export const DATA_RESIDENCY_ZONES = ['UK_ONLY', 'UK_AND_EEA', 'GLOBAL_RESTRICTED'] as const;
export type DataResidencyZone = PrismaDataResidencyZone;

export const DATA_CLASSIFICATION_LEVELS = [
    'OFFICIAL',
    'OFFICIAL_SENSITIVE',
    'SECRET',
    'TOP_SECRET',
] as const;
export type DataClassificationLevel = PrismaDataClassificationLevel;

export interface TenantMetadata {
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource: string;
    auditBatchId?: string;
}

export interface TenantScope extends TenantMetadata {
    orgId: OrgId;
}
