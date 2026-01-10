import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaChecklistInstanceRepository } from '@/server/repositories/prisma/hr/onboarding/prisma-checklist-instance-repository';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { getEmployeeChecklists } from './get-employee-checklists';

export interface GetEmployeeChecklistsForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface GetEmployeeChecklistsForUiResult {
    instances: ChecklistInstance[];
}

function resolveChecklistInstanceRepository(): PrismaChecklistInstanceRepository {
    return new PrismaChecklistInstanceRepository();
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
            { checklistInstanceRepository: resolveChecklistInstanceRepository() },
            cachedInput,
        );

        return { instances: result.instances };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await getEmployeeChecklists(
            { checklistInstanceRepository: resolveChecklistInstanceRepository() },
            input,
        );

        return { instances: result.instances };
    }

    return getChecklistsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
