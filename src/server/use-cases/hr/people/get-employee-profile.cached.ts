import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { getEmployeeProfile } from './get-employee-profile';
import { createEmployeeProfileRepository } from '@/server/services/hr/people/people-repository.factory';

export interface GetEmployeeProfileForUiInput {
    authorization: RepositoryAuthorizationContext;
    profileId: string;
}

export interface GetEmployeeProfileForUiResult {
    profile: EmployeeProfile | null;
}

function resolveEmployeeProfileRepository(): IEmployeeProfileRepository {
    return createEmployeeProfileRepository();
}

export async function getEmployeeProfileForUi(
    input: GetEmployeeProfileForUiInput,
): Promise<GetEmployeeProfileForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.EMPLOYEE_PROFILE,
        resourceId: input.profileId,
    });
    async function getProfileCached(
        cachedInput: GetEmployeeProfileForUiInput,
    ): Promise<GetEmployeeProfileForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        return getEmployeeProfile(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: cachedInput.authorization, profileId: cachedInput.profileId },
        );
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        return getEmployeeProfile(
            { employeeProfileRepository: resolveEmployeeProfileRepository() },
            { authorization: input.authorization, profileId: input.profileId },
        );
    }

    return getProfileCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
