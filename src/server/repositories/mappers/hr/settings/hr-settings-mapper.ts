import type { HRSettings as PrismaHRSettings } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { HRSettings } from '@/server/types/hr-ops-types';

export function mapPrismaHRSettingsToDomain(record: PrismaHRSettings): HRSettings {
  return {
    orgId: record.orgId,
    leaveTypes: record.leaveTypes,
    workingHours: record.workingHours,
    approvalWorkflows: record.approvalWorkflows,
    overtimePolicy: record.overtimePolicy,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainHRSettingsToPrismaUpsert(
  orgId: string,
  input: Omit<HRSettings, 'orgId' | 'createdAt' | 'updatedAt'>,
): Prisma.HRSettingsUpsertArgs['create'] {
  return {
    orgId,
    leaveTypes: input.leaveTypes ?? undefined,
    workingHours: input.workingHours ?? undefined,
    approvalWorkflows: input.approvalWorkflows ?? undefined,
    overtimePolicy: input.overtimePolicy ?? undefined,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ?? undefined,
  };
}
