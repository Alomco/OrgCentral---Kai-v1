import type { Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { ITimeEntryRepository } from '@/server/repositories/contracts/hr/time-tracking/time-entry-repository-contract';
import { mapDomainTimeEntryToPrismaCreate, mapDomainTimeEntryToPrismaUpdate, mapPrismaTimeEntryToDomain } from '@/server/repositories/mappers/hr/time-tracking/time-entry-mapper';
import type { TimeEntry } from '@/server/types/hr-ops-types';

export class PrismaTimeEntryRepository extends BasePrismaRepository implements ITimeEntryRepository {
  async createTimeEntry(
    orgId: string,
    input: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: TimeEntry['status'] },
  ): Promise<TimeEntry> {
    const data = mapDomainTimeEntryToPrismaCreate({ ...input, status: input.status ?? 'ACTIVE' });
    const rec = await this.prisma.timeEntry.create({ data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant time entry creation mismatch');
    }
    return mapPrismaTimeEntryToDomain(rec);
  }

  async updateTimeEntry(
    orgId: string,
    id: string,
    updates: Partial<Pick<TimeEntry, 'clockIn' | 'clockOut' | 'totalHours' | 'breakDuration' | 'project' | 'tasks' | 'notes' | 'status' | 'approvedByOrgId' | 'approvedByUserId' | 'approvedAt' | 'dataClassification' | 'residencyTag' | 'metadata'>>,
  ): Promise<TimeEntry> {
    const data = mapDomainTimeEntryToPrismaUpdate(updates);
    const rec = await this.prisma.timeEntry.update({ where: { id }, data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant time entry update mismatch');
    }
    return mapPrismaTimeEntryToDomain(rec);
  }

  async getTimeEntry(orgId: string, id: string): Promise<TimeEntry | null> {
    const rec = await this.prisma.timeEntry.findFirst({ where: { id, orgId } });
    return rec ? mapPrismaTimeEntryToDomain(rec) : null;
  }

  async listTimeEntries(
    orgId: string,
    filters?: { userId?: string; status?: TimeEntry['status']; from?: Date; to?: Date },
  ): Promise<TimeEntry[]> {
    const where: Prisma.TimeEntryWhereInput = { orgId };
    if (filters?.userId) { where.userId = filters.userId; }
    if (filters?.status) { where.status = filters.status; }
    if (filters?.from || filters?.to) {
      where.date = { gte: filters.from ?? undefined, lte: filters.to ?? undefined };
    }
    const recs = await this.prisma.timeEntry.findMany({ where, orderBy: { date: 'desc' } });
    return recs.map(mapPrismaTimeEntryToDomain);
  }
}
