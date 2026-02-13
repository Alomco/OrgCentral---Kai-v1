import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import { createAbsenceSettingsRepository } from '@/server/repositories/providers/hr/absence-settings-repository-provider';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { getAbsenceSettings } from './get-absence-settings';

export interface GetAbsenceSettingsForUiInput {
    authorization: RepositoryAuthorizationContext;
}

export interface GetAbsenceSettingsForUiResult {
    settings: Awaited<ReturnType<typeof getAbsenceSettings>>['settings'];
}

function resolveAbsenceSettingsRepository(): IAbsenceSettingsRepository {
    return createAbsenceSettingsRepository();
}

export async function getAbsenceSettingsForUi(
    input: GetAbsenceSettingsForUiInput,
): Promise<GetAbsenceSettingsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.ABSENCE_SETTINGS,
    });
    async function getSettingsCached(
        cachedInput: GetAbsenceSettingsForUiInput,
    ): Promise<GetAbsenceSettingsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return getAbsenceSettings(
            { absenceSettingsRepository: resolveAbsenceSettingsRepository() },
            { authorization: cachedInput.authorization },
        );
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getAbsenceSettings(
            { absenceSettingsRepository: resolveAbsenceSettingsRepository() },
            { authorization: input.authorization },
        );
    }

    return getSettingsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
