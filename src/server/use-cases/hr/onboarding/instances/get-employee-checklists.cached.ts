import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { getEmployeeChecklists } from './get-employee-checklists';
import { getChecklistInstanceRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';

export interface GetEmployeeChecklistsForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface GetEmployeeChecklistsForUiResult {
    instances: ChecklistInstance[];
}

export async function getEmployeeChecklistsForUi(
    input: GetEmployeeChecklistsForUiInput,
): Promise<GetEmployeeChecklistsForUiResult> {
    async function getChecklistsCached(
        cachedInput: GetEmployeeChecklistsForUiInput,
    ): Promise<GetEmployeeChecklistsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await getEmployeeChecklists(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            cachedInput,
        );

        return { instances: result.instances };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getEmployeeChecklists(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            input,
        );

        return { instances: result.instances };
    }

    return getChecklistsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
