import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ChecklistInstance } from '@/server/types/onboarding-types';
import { getActiveChecklistForEmployee } from './get-active-checklist';
import { getChecklistInstanceRepository } from '@/server/services/hr/onboarding/onboarding-controller-dependencies';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.ONBOARDING_CHECKLIST,
        resourceId: input.employeeId,
    });
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
