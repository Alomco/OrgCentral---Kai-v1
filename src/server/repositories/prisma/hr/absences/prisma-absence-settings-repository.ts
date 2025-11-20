import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import { mapDomainAbsenceSettingsToPrismaUpsert, mapPrismaAbsenceSettingsToDomain } from '@/server/repositories/mappers/hr/absences/absences-mapper';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';

export class PrismaAbsenceSettingsRepository extends BasePrismaRepository implements IAbsenceSettingsRepository {
  async getSettings(orgId: string): Promise<AbsenceSettings | null> {
    const rec = await this.prisma.absenceSettings.findUnique({ where: { orgId } });
    return rec ? mapPrismaAbsenceSettingsToDomain(rec) : null;
  }

  async upsertSettings(orgId: string, settings: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>): Promise<AbsenceSettings> {
    const data = mapDomainAbsenceSettingsToPrismaUpsert(orgId, settings);
    const rec = await this.prisma.absenceSettings.upsert({
      where: { orgId },
      create: data,
      update: data,
    });
    return mapPrismaAbsenceSettingsToDomain(rec);
  }
}
