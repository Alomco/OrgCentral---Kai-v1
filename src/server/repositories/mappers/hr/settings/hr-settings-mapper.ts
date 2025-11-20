import type { HRSettings as PrismaHRSettings } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { HRSettings } from '@/server/types/hr-ops-types';

export function mapPrismaHRSettingsToDomain(record: PrismaHRSettings): HRSettings {
  return {
    orgId: record.orgId,
    leaveTypes: record.leaveTypes as Prisma.JsonValue | undefined,
    workingHours: record.workingHours as Prisma.JsonValue | undefined,
    approvalWorkflows: record.approvalWorkflows as Prisma.JsonValue | undefined,
    overtimePolicy: record.overtimePolicy as Prisma.JsonValue | undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata as Prisma.JsonValue | undefined,
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
