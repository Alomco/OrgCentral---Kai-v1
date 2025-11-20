import type { TimeEntry as PrismaTimeEntry } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import type { TimeEntry } from '@/server/types/hr-ops-types';

export function mapPrismaTimeEntryToDomain(record: PrismaTimeEntry): TimeEntry {
  return {
    id: record.id,
    orgId: record.orgId,
    userId: record.userId,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut ?? undefined,
    totalHours: record.totalHours ? Number(record.totalHours) : undefined,
    breakDuration: record.breakDuration ? Number(record.breakDuration) : undefined,
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
    tasks: input.tasks ?? undefined,
    notes: input.notes ?? null,
    status: input.status,
    approvedByOrgId: input.approvedByOrgId ?? null,
    approvedByUserId: input.approvedByUserId ?? null,
    approvedAt: input.approvedAt ?? null,
    dataClassification: input.dataClassification,
    residencyTag: input.residencyTag,
    metadata: input.metadata ?? undefined,
  };
}

export function mapDomainTimeEntryToPrismaUpdate(
  updates: Partial<Pick<TimeEntry, 'clockIn' | 'clockOut' | 'totalHours' | 'breakDuration' | 'project' | 'tasks' | 'notes' | 'status' | 'approvedByOrgId' | 'approvedByUserId' | 'approvedAt' | 'dataClassification' | 'residencyTag' | 'metadata'>>,
): Prisma.TimeEntryUncheckedUpdateInput {
  return {
    clockIn: updates.clockIn,
    clockOut: updates.clockOut ?? undefined,
    totalHours: updates.totalHours ?? undefined,
    breakDuration: updates.breakDuration ?? undefined,
    project: updates.project ?? undefined,
    tasks: updates.tasks ?? undefined,
    notes: updates.notes ?? undefined,
    status: updates.status ?? undefined,
    approvedByOrgId: updates.approvedByOrgId ?? undefined,
    approvedByUserId: updates.approvedByUserId ?? undefined,
    approvedAt: updates.approvedAt ?? undefined,
    dataClassification: updates.dataClassification ?? undefined,
    residencyTag: updates.residencyTag ?? undefined,
    metadata: updates.metadata ?? undefined,
  };
}
