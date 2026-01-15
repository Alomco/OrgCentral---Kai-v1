import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { getActiveChecklistForEmployee } from './get-active-checklist';
import { getChecklistInstanceRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';

export interface GetActiveChecklistForEmployeeForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface GetActiveChecklistForEmployeeForUiResult {
    instance: ChecklistInstance | null;
}

export async function getActiveChecklistForEmployeeForUi(
    input: GetActiveChecklistForEmployeeForUiInput,
): Promise<GetActiveChecklistForEmployeeForUiResult> {
    async function getActiveChecklistCached(
        cachedInput: GetActiveChecklistForEmployeeForUiInput,
    ): Promise<GetActiveChecklistForEmployeeForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await getActiveChecklistForEmployee(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            cachedInput,
        );

        return { instance: result.instance };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getActiveChecklistForEmployee(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            input,
        );

        return { instance: result.instance };
    }

    return getActiveChecklistCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
