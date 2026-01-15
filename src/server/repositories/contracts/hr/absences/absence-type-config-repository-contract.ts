import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface IAbsenceTypeConfigRepository {
  createConfig(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    input: Omit<AbsenceTypeConfig, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AbsenceTypeConfig>;
  updateConfig(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    id: string,
    updates: Partial<Pick<AbsenceTypeConfig, 'label' | 'tracksBalance' | 'isActive' | 'metadata'>>,
  ): Promise<AbsenceTypeConfig>;
  getConfig(contextOrOrgId: RepositoryAuthorizationContext | string, id: string): Promise<AbsenceTypeConfig | null>;
  getConfigByKey(contextOrOrgId: RepositoryAuthorizationContext | string, key: string): Promise<AbsenceTypeConfig | null>;
  getConfigs(
    contextOrOrgId: RepositoryAuthorizationContext | string,
    options?: { includeInactive?: boolean },
  ): Promise<AbsenceTypeConfig[]>;
}
