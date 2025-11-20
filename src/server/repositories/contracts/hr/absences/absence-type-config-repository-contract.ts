import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';

export interface IAbsenceTypeConfigRepository {
  createConfig(orgId: string, input: Omit<AbsenceTypeConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbsenceTypeConfig>;
  updateConfig(orgId: string, id: string, updates: Partial<Pick<AbsenceTypeConfig, 'label' | 'tracksBalance' | 'isActive' | 'metadata'>>): Promise<AbsenceTypeConfig>;
  getConfig(orgId: string, id: string): Promise<AbsenceTypeConfig | null>;
  getConfigs(orgId: string, options?: { includeInactive?: boolean }): Promise<AbsenceTypeConfig[]>;
}
