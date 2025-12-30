import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { enforcePermission } from '@/server/repositories/security';
import type { IEnterpriseSettingsRepository } from '@/server/repositories/contracts/platform/settings/enterprise-settings-repository-contract';
import type { EnterpriseSettings } from '@/server/types/platform-types';
import { parseEnterpriseSettingsUpdate } from '@/server/validators/platform/settings-validators';


export interface UpdateEnterpriseSettingsInput {
    authorization: RepositoryAuthorizationContext;
    updates: unknown;
}

export interface UpdateEnterpriseSettingsDependencies {
    enterpriseSettingsRepository: IEnterpriseSettingsRepository;
}

export interface UpdateEnterpriseSettingsResult {
    settings: EnterpriseSettings;
}

export async function updateEnterpriseSettings(
    deps: UpdateEnterpriseSettingsDependencies,
    input: UpdateEnterpriseSettingsInput,
): Promise<UpdateEnterpriseSettingsResult> {

    // Authorization: Only global admins can update enterprise settings.
    enforcePermission(input.authorization, 'platformSettings', 'update');

    const validatedUpdates = parseEnterpriseSettingsUpdate(input.updates);

    const settings = await deps.enterpriseSettingsRepository.updateSettings(validatedUpdates);

    return { settings };
}
