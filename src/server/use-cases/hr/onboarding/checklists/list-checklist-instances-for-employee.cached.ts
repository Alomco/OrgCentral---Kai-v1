import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { listChecklistInstancesForEmployee } from './list-checklist-instances-for-employee';
import { getChecklistInstanceRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListChecklistInstancesForEmployeeForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface ListChecklistInstancesForEmployeeForUiResult {
    instances: ChecklistInstance[];
}

export async function listChecklistInstancesForEmployeeForUi(
    input: ListChecklistInstancesForEmployeeForUiInput,
): Promise<ListChecklistInstancesForEmployeeForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ONBOARDING_CHECKLIST,
        resourceId: input.employeeId,
    });
    async function listInstancesCached(
        cachedInput: ListChecklistInstancesForEmployeeForUiInput,
    ): Promise<ListChecklistInstancesForEmployeeForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listChecklistInstancesForEmployee(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            cachedInput,
        );

        return { instances: result.instances };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listChecklistInstancesForEmployee(
            { checklistInstanceRepository: getChecklistInstanceRepository() },
            input,
        );

        return { instances: result.instances };
    }

    return listInstancesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
