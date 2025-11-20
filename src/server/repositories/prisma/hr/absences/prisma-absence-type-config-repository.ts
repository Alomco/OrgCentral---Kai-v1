import type { Prisma } from '@prisma/client';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';
import { mapDomainAbsenceTypeConfigToPrismaCreate, mapDomainAbsenceTypeConfigToPrismaUpdate, mapPrismaAbsenceTypeConfigToDomain } from '@/server/repositories/mappers/hr/absences/absences-mapper';
import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';

export class PrismaAbsenceTypeConfigRepository extends BasePrismaRepository implements IAbsenceTypeConfigRepository {
  async createConfig(orgId: string, input: Omit<AbsenceTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbsenceTypeConfig> {
    const data = mapDomainAbsenceTypeConfigToPrismaCreate({ ...input, orgId });
    const created = await this.prisma.absenceTypeConfig.create({ data });
    return mapPrismaAbsenceTypeConfigToDomain(created);
  }

  async updateConfig(
    orgId: string,
    id: string,
    updates: Partial<Pick<AbsenceTypeConfig, 'label' | 'tracksBalance' | 'isActive' | 'metadata'>>,
  ): Promise<AbsenceTypeConfig> {
    const data = mapDomainAbsenceTypeConfigToPrismaUpdate(updates);
    const updated = await this.prisma.absenceTypeConfig.update({
      where: { id },
      data,
    });
    // Optional: ensure orgId matches
    if (updated.orgId !== orgId) {
      throw new Error('Cross-tenant absence type access denied');
    }
    return mapPrismaAbsenceTypeConfigToDomain(updated);
  }

  async getConfig(orgId: string, id: string): Promise<AbsenceTypeConfig | null> {
    const rec = await this.prisma.absenceTypeConfig.findFirst({ where: { id, orgId } });
    return rec ? mapPrismaAbsenceTypeConfigToDomain(rec) : null;
  }

  async getConfigs(orgId: string, options?: { includeInactive?: boolean }): Promise<AbsenceTypeConfig[]> {
    const where: Prisma.AbsenceTypeConfigWhereInput = { orgId };
    if (!options?.includeInactive) {
      where.isActive = true;
    }
    const recs = await this.prisma.absenceTypeConfig.findMany({ where, orderBy: { label: 'asc' } });
    return recs.map(mapPrismaAbsenceTypeConfigToDomain);
  }
}
