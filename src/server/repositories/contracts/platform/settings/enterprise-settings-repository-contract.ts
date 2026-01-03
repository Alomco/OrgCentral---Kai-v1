import type { EnterpriseSettings } from '@/server/types/platform-types';

export interface IEnterpriseSettingsRepository {
    getSettings(): Promise<EnterpriseSettings>;
    updateSettings(settings: Partial<EnterpriseSettings>): Promise<EnterpriseSettings>;
}
