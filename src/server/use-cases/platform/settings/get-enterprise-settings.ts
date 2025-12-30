import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { enforcePermission } from '@/server/repositories/security';
import type { IEnterpriseSettingsRepository } from '@/server/repositories/contracts/platform/settings/enterprise-settings-repository-contract';
import type { EnterpriseSettings } from '@/server/types/platform-types';


export interface GetEnterpriseSettingsInput {
    authorization: RepositoryAuthorizationContext;
}

export interface GetEnterpriseSettingsDependencies {
    enterpriseSettingsRepository: IEnterpriseSettingsRepository;
}

export interface GetEnterpriseSettingsResult {
    settings: EnterpriseSettings;
}

export async function getEnterpriseSettings(
    deps: GetEnterpriseSettingsDependencies,
    input: GetEnterpriseSettingsInput,
): Promise<GetEnterpriseSettingsResult> {
    // Authorization: Only global admins can read enterprise settings.
    enforcePermission(input.authorization, 'platformSettings', 'read');

    const settings = await deps.enterpriseSettingsRepository.getSettings();
    return { settings };
}
