import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceReminderSettingsRepository } from '@/server/repositories/contracts/hr/compliance/compliance-reminder-settings-repository-contract';
import { createComplianceReminderSettingsRepository } from '@/server/repositories/providers/hr/compliance-reminder-settings-repository-provider';
import { getComplianceReminderSettings } from './get-compliance-reminder-settings';

export interface GetComplianceReminderSettingsForUiInput {
    authorization: RepositoryAuthorizationContext;
}

export type GetComplianceReminderSettingsForUiResult = Awaited<ReturnType<typeof getComplianceReminderSettings>>;

function resolveComplianceReminderSettingsRepository(): IComplianceReminderSettingsRepository {
    return createComplianceReminderSettingsRepository();
}

export async function getComplianceReminderSettingsForUi(
    input: GetComplianceReminderSettingsForUiInput,
): Promise<GetComplianceReminderSettingsForUiResult> {
    async function getCached(
        cachedInput: GetComplianceReminderSettingsForUiInput,
    ): Promise<GetComplianceReminderSettingsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);
        return getComplianceReminderSettings(
            { complianceReminderSettingsRepository: resolveComplianceReminderSettingsRepository() },
            { authorization: cachedInput.authorization },
        );
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getComplianceReminderSettings(
            { complianceReminderSettingsRepository: resolveComplianceReminderSettingsRepository() },
            { authorization: input.authorization },
        );
    }

    return getCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
