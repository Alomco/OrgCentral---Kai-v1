import type { TimeEntry as PrismaTimeEntry } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { TimeEntry } from '@/server/types/hr-ops-types';

export function mapPrismaTimeEntryToDomain(record: PrismaTimeEntry): TimeEntry {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut ?? undefined,
    totalHours: record.totalHours === null ? undefined : Number(record.totalHours),
    breakDuration: record.breakDuration === null ? undefined : Number(record.breakDuration),
    project: record.project ?? undefined,
    tasks: record.tasks as Prisma.JsonValue | undefined,
    notes: record.notes ?? undefined,
    status: record.status,
    approvedByOrgId: record.approvedByOrgId ?? undefined,
    approvedByUserId: record.approvedByUserId ?? undefined,
    approvedAt: record.approvedAt ?? undefined,
    dataClassification: record.dataClassification,
    residencyTag: record.residencyTag,
    metadata: record.metadata as Prisma.JsonValue | undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function mapDomainTimeEntryToPrismaCreate(
  input: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>,
): Prisma.TimeEntryUncheckedCreateInput {
  return {
    orgId: input.orgId,
    userId: input.userId,
    date: input.date,
    clockIn: input.clockIn,
    clockOut: input.clockOut ?? null,
    totalHours: input.totalHours ?? null,
    breakDuration: input.breakDuration ?? null,
    project: input.project ?? null,
    tasks: toJsonInput(input.tasks),
    notes: input.notes ?? null,
    status: input.status,
    approvedByOrgId: input.approvedByOrgId ?? null,
    approvedByUserId: input.approvedByUserId ?? null,
    approvedAt: input.approvedAt ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: toJsonInput(input.metadata),
  };
}

export function mapDomainTimeEntryToPrismaUpdate(
  updates: Partial<Pick<TimeEntry, 'clockIn' | 'clockOut' | 'totalHours' | 'breakDuration' | 'project' | 'tasks' | 'notes' | 'status' | 'approvedByOrgId' | 'approvedByUserId' | 'approvedAt' | 'dataClassification' | 'residencyTag' | 'metadata'>>,
): Prisma.TimeEntryUncheckedUpdateInput {
  return {
    clockIn: updates.clockIn,
    clockOut: updates.clockOut,
    totalHours: updates.totalHours,
    breakDuration: updates.breakDuration,
    project: updates.project,
    tasks: toJsonInput(updates.tasks),
    notes: updates.notes,
    status: updates.status,
    approvedByOrgId: updates.approvedByOrgId,
    approvedByUserId: updates.approvedByUserId,
    approvedAt: updates.approvedAt,
    dataClassification: updates.dataClassification,
    residencyTag: updates.residencyTag,
    metadata: toJsonInput(updates.metadata),
  };
}

function toJsonInput(
  value: Prisma.JsonValue | null | undefined,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return Prisma.DbNull;
  }
  return value as Prisma.InputJsonValue;
}
