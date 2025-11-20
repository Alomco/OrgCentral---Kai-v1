import type { AbsenceSettings } from '@/server/types/hr-ops-types';

export interface IAbsenceSettingsRepository {
  getSettings(orgId: string): Promise<AbsenceSettings | null>;
  upsertSettings(orgId: string, settings: Omit<AbsenceSettings, 'orgId' | 'createdAt' | 'updatedAt'>): Promise<AbsenceSettings>;
}
