import type { AbsenceSettings } from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface IAbsenceSettingsRepository {
  getSettings(contextOrOrgId: RepositoryAuthorizationContext | string): Promise<AbsenceSettings | null>;
  upsertSettings(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    settings: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>,
  ): Promise<AbsenceSettings>;
}
