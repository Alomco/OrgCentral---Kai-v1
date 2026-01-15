import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import { mapDomainAbsenceSettingsToPrismaUpsert, mapPrismaAbsenceSettingsToDomain } from '@/server/repositories/mappers/hr/absences/absences-mapper';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export class PrismaAbsenceSettingsRepository extends BasePrismaRepository implements IAbsenceSettingsRepository {
  async getSettings(contextOrOrgId: RepositoryAuthorizationContext | string): Promise<AbsenceSettings | null> {
    const context = this.normalizeAuthorizationContext(contextOrOrgId, 'absence_settings');
    const rec = await this.prisma.absenceSettings.findUnique({ where: { orgId: context.orgId } });
    return rec ? mapPrismaAbsenceSettingsToDomain(this.assertTenantRecord(rec, context, 'absence_settings')) : null;
  }

  async upsertSettings(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    settings: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AbsenceSettings> {
    const context = this.normalizeAuthorizationContext(contextOrOrgId, 'absence_settings');
    this.validateTenantWriteAccess(context, context.orgId, 'write');

    const data = mapDomainAbsenceSettingsToPrismaUpsert(context.orgId, settings);
    const rec = await this.prisma.absenceSettings.upsert({
      where: { orgId: context.orgId },
      create: data,
      update: data,
    });

    return mapPrismaAbsenceSettingsToDomain(this.assertTenantRecord(rec, context, 'absence_settings'));
  }
}
