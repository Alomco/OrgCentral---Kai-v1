import { buildEnterpriseSettingsServiceDependencies, type EnterpriseSettingsServiceDependencies } from '@/server/repositories/providers/platform/settings/enterprise-settings-service-dependencies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getEnterpriseSettings } from '@/server/use-cases/platform/settings/get-enterprise-settings';
import { updateEnterpriseSettings } from '@/server/use-cases/platform/settings/update-enterprise-settings';
import type { EnterpriseSettings } from '@/server/types/platform-types';

const defaultDependencies = buildEnterpriseSettingsServiceDependencies();

function resolveDependencies(
    overrides?: Partial<EnterpriseSettingsServiceDependencies>,
): EnterpriseSettingsServiceDependencies {
    if (!overrides) {
        return defaultDependencies;
    }
    return { ...defaultDependencies, ...overrides };
}

export async function fetchEnterpriseSettings(
    authorization: RepositoryAuthorizationContext,
    overrides?: Partial<EnterpriseSettingsServiceDependencies>,
) {
    const dependencies = resolveDependencies(overrides);
    return getEnterpriseSettings(dependencies, { authorization });
}

export async function saveEnterpriseSettings(
    authorization: RepositoryAuthorizationContext,
    updates: Partial<EnterpriseSettings>,
    overrides?: Partial<EnterpriseSettingsServiceDependencies>,
) {
    const dependencies = resolveDependencies(overrides);
    return updateEnterpriseSettings(dependencies, { authorization, updates });
}

export type { EnterpriseSettings };