import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { HRSettings } from '@/server/types/hr-ops-types';
import { buildHrSettingsServiceDependencies } from '@/server/repositories/providers/hr/hr-settings-service-dependencies';
import { getHrSettings } from './get-hr-settings';
import { registerHrSettingsCacheTag } from './cache-helpers';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetHrSettingsCachedInput {
    authorization: RepositoryAuthorizationContext;
    orgId: string;
}

export interface GetHrSettingsCachedResult {
    settings: HRSettings;
}

function resolveHrSettingsRepository(): IHRSettingsRepository {
    return buildHrSettingsServiceDependencies().hrSettingsRepository;
}

export async function getHrSettingsForUi(input: GetHrSettingsCachedInput): Promise<GetHrSettingsCachedResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.HR_SETTINGS,
        resourceId: input.orgId,
    });
    async function getHrSettingsCached(
        cachedInput: GetHrSettingsCachedInput,
    ): Promise<GetHrSettingsCachedResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        registerHrSettingsCacheTag(cachedInput.authorization);

        const result = await getHrSettings(
            { hrSettingsRepository: resolveHrSettingsRepository() },
            cachedInput,
        );
        return { settings: result.settings };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const result = await getHrSettings(
            { hrSettingsRepository: resolveHrSettingsRepository() },
            input,
        );
        return { settings: result.settings };
    }

    return getHrSettingsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
