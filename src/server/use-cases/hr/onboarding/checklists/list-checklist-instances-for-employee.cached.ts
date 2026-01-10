import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaChecklistInstanceRepository } from '@/server/repositories/prisma/hr/onboarding/prisma-checklist-instance-repository';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { listChecklistInstancesForEmployee } from './list-checklist-instances-for-employee';

export interface ListChecklistInstancesForEmployeeForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface ListChecklistInstancesForEmployeeForUiResult {
    instances: ChecklistInstance[];
}

function resolveChecklistInstanceRepository(): PrismaChecklistInstanceRepository {
    return new PrismaChecklistInstanceRepository();
}

export async function listChecklistInstancesForEmployeeForUi(
    input: ListChecklistInstancesForEmployeeForUiInput,
): Promise<ListChecklistInstancesForEmployeeForUiResult> {
    async function listInstancesCached(
        cachedInput: ListChecklistInstancesForEmployeeForUiInput,
    ): Promise<ListChecklistInstancesForEmployeeForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listChecklistInstancesForEmployee(
            { checklistInstanceRepository: resolveChecklistInstanceRepository() },
            cachedInput,
        );

        return { instances: result.instances };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listChecklistInstancesForEmployee(
            { checklistInstanceRepository: resolveChecklistInstanceRepository() },
            input,
        );

        return { instances: result.instances };
    }

    return listInstancesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
