import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { getEmployeeProfileByUser } from './get-employee-profile-by-user';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface GetEmployeeProfileByUserForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
}

export interface GetEmployeeProfileByUserForUiResult {
    profile: EmployeeProfile | null;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
    return createEmployeeProfileRepository();
}

export async function getEmployeeProfileByUserForUi(
    input: GetEmployeeProfileByUserForUiInput,
): Promise<GetEmployeeProfileByUserForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
        resourceId: input.userId,
    });
    async function getProfileCached(
        cachedInput: GetEmployeeProfileByUserForUiInput,
    ): Promise<GetEmployeeProfileByUserForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return getEmployeeProfileByUser(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: cachedInput.authorization, userId: cachedInput.userId },
        );
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getEmployeeProfileByUser(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: input.authorization, userId: input.userId },
        );
    }

    return getProfileCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
