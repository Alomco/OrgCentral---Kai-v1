import type { EnhancedSecurityEvent } from '@/server/types/enhanced-security-types';
import {
  DATA_CLASSIFICATION_LEVELS,
  DATA_RESIDENCY_ZONES,
  type DataClassificationLevel,
  type DataResidencyZone,
} from '@/server/types/tenant';
import type { Prisma } from '@/server/types/prisma';

type JsonRecord = Record<string, Prisma.JsonValue>;

const isJsonRecord = (
  value: Prisma.JsonValue | null | undefined,
): value is JsonRecord =>
  value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value: Prisma.JsonValue | undefined): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const toClassification = (
  value: Prisma.JsonValue | undefined,
  fallback: DataClassificationLevel,
): DataClassificationLevel =>
  typeof value === 'string' && DATA_CLASSIFICATION_LEVELS.includes(value as DataClassificationLevel)
    ? (value as DataClassificationLevel)
    : fallback;

const toResidency = (
  value: Prisma.JsonValue | undefined,
  fallback: DataResidencyZone,
): DataResidencyZone =>
  typeof value === 'string' && DATA_RESIDENCY_ZONES.includes(value as DataResidencyZone)
    ? (value as DataResidencyZone)
    : fallback;

export function buildAdditionalInfo(
  event: Omit<EnhancedSecurityEvent, 'id' | 'createdAt' | 'updatedAt'>,
): Prisma.JsonValue | undefined {
  const base = isJsonRecord(event.additionalInfo) ? { ...event.additionalInfo } : {};
  if (event.resourceId) {
    base.resourceId = event.resourceId;
  }
  if (event.resourceType) {
    base.resourceType = event.resourceType;
  }
  if (event.metadata !== undefined) {
    base.metadata = event.metadata;
  }
  if (event.piiDetected !== undefined) {
    base.piiDetected = event.piiDetected;
  }
  if (event.piiAccessed !== undefined) {
    base.piiAccessed = event.piiAccessed;
  }
  if (event.dataBreachPotential !== undefined) {
    base.dataBreachPotential = event.dataBreachPotential;
  }
  if (event.remediationSteps !== undefined) {
    base.remediationSteps = event.remediationSteps;
  }
  base.dataClassification = event.dataClassification;
  base.dataResidency = event.dataResidency;
  return Object.keys(base).length > 0 ? base : event.additionalInfo;
}

export function extractEnhancedFields(additionalInfo: Prisma.JsonValue | null | undefined): {
  dataClassification?: DataClassificationLevel;
  dataResidency?: DataResidencyZone;
  resourceId?: string;
  resourceType?: string;
  metadata?: Prisma.JsonValue;
  piiDetected?: boolean;
  piiAccessed?: boolean;
  dataBreachPotential?: boolean;
  remediationSteps?: string[];
} {
  if (!isJsonRecord(additionalInfo)) {
    return {};
  }
  return {
    dataClassification: toClassification(
      additionalInfo.dataClassification,
      'OFFICIAL',
    ),
    dataResidency: toResidency(
      additionalInfo.dataResidency,
      'UK_ONLY',
    ),
    resourceId: typeof additionalInfo.resourceId === 'string' ? additionalInfo.resourceId : undefined,
    resourceType: typeof additionalInfo.resourceType === 'string' ? additionalInfo.resourceType : undefined,
    metadata: additionalInfo.metadata,
    piiDetected: typeof additionalInfo.piiDetected === 'boolean' ? additionalInfo.piiDetected : undefined,
    piiAccessed: typeof additionalInfo.piiAccessed === 'boolean' ? additionalInfo.piiAccessed : undefined,
    dataBreachPotential:
      typeof additionalInfo.dataBreachPotential === 'boolean'
        ? additionalInfo.dataBreachPotential
        : undefined,
    remediationSteps: isStringArray(additionalInfo.remediationSteps)
      ? additionalInfo.remediationSteps
      : undefined,
  };
}
