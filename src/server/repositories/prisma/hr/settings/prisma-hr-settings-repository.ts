import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import {
  mapDomainHRSettingsToPrismaCreate,
  mapDomainHRSettingsToPrismaUpdate,
  mapPrismaHRSettingsToDomain,
} from '@/server/repositories/mappers/hr/settings/hr-settings-mapper';
import type { HRSettings } from '@/server/types/hr-ops-types';

export class PrismaHRSettingsRepository extends BasePrismaRepository implements IHRSettingsRepository {
  async getSettings(orgId: string): Promise<HRSettings | null> {
    const rec = await this.prisma.hRSettings.findUnique({ where: { orgId } });
    return rec ? mapPrismaHRSettingsToDomain(rec) : null;
  }

  async upsertSettings(orgId: string, settings: Omit<HRSettings, 'orgId' | 'createdAt' | 'updatedAt'>): Promise<HRSettings> {
    const create = mapDomainHRSettingsToPrismaCreate(orgId, settings);
    const update = mapDomainHRSettingsToPrismaUpdate(settings);
    const rec = await this.prisma.hRSettings.upsert({
      where: { orgId },
      create,
      update,
    });
    return mapPrismaHRSettingsToDomain(rec);
  }
}
