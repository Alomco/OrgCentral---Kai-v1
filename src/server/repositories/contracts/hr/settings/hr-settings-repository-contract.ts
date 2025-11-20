import type { HRSettings } from '@/server/types/hr-ops-types';

export interface IHRSettingsRepository {
  getSettings(orgId: string): Promise<HRSettings | null>;
  upsertSettings(orgId: string, settings: Omit<HRSettings, 'orgId' | 'createdAt' | 'updatedAt'>): Promise<HRSettings>;
}
