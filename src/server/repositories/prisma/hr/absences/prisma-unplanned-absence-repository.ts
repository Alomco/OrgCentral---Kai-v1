import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import { mapDomainUnplannedAbsenceToPrismaCreate, mapDomainUnplannedAbsenceToPrismaUpdate, mapPrismaUnplannedAbsenceToDomain } from '@/server/repositories/mappers/hr/absences/absences-mapper';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { Prisma } from '@prisma/client';

export class PrismaUnplannedAbsenceRepository extends BasePrismaRepository implements IUnplannedAbsenceRepository {
  async createAbsence(
    orgId: string,
    input: Omit<UnplannedAbsence, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: UnplannedAbsence['status'] },
  ): Promise<UnplannedAbsence> {
    const data = mapDomainUnplannedAbsenceToPrismaCreate({ ...input, status: input.status ?? 'REPORTED' });
    const rec = await this.prisma.unplannedAbsence.create({ data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant absence creation mismatch');
    }
    return mapPrismaUnplannedAbsenceToDomain(rec);
  }

  async updateAbsence(
    orgId: string,
    id: string,
    updates: Partial<Pick<UnplannedAbsence, 'status' | 'reason' | 'approverOrgId' | 'approverUserId' | 'healthStatus' | 'metadata' | 'dataClassification' | 'residencyTag'>>,
  ): Promise<UnplannedAbsence> {
    const data = mapDomainUnplannedAbsenceToPrismaUpdate(updates);
    const rec = await this.prisma.unplannedAbsence.update({ where: { id }, data });
    if (rec.orgId !== orgId) {
      throw new Error('Cross-tenant absence update mismatch');
    }
    return mapPrismaUnplannedAbsenceToDomain(rec);
  }

  async getAbsence(orgId: string, id: string): Promise<UnplannedAbsence | null> {
    const rec = await this.prisma.unplannedAbsence.findFirst({ where: { id, orgId } });
    return rec ? mapPrismaUnplannedAbsenceToDomain(rec) : null;
  }

  async listAbsences(
    orgId: string,
    filters?: { userId?: string; status?: UnplannedAbsence['status']; includeClosed?: boolean; from?: Date; to?: Date },
  ): Promise<UnplannedAbsence[]> {
    const where: Prisma.UnplannedAbsenceWhereInput = { orgId };
    if (filters?.userId) { where.userId = filters.userId; }
    if (filters?.status) { where.status = filters.status; }
    if (!filters?.includeClosed) {
      where.status = { in: ['REPORTED', 'APPROVED', 'REJECTED', 'CANCELLED'] };
    }
    if (filters?.from || filters?.to) {
      where.startDate = { gte: filters.from ?? undefined, lte: filters.to ?? undefined };
    }
    const recs = await this.prisma.unplannedAbsence.findMany({ where, orderBy: { startDate: 'desc' } });
    return recs.map(mapPrismaUnplannedAbsenceToDomain);
  }
}
