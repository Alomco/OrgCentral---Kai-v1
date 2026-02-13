import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { LeavePolicy } from '@/server/types/leave-types';
import { listLeavePolicies, type ListLeavePoliciesInput } from './list-leave-policies';
import { createLeavePolicyRepository } from '@/server/services/hr/leave/leave-repository.factory';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListLeavePoliciesForUiInput {
    authorization: RepositoryAuthorizationContext;
    payload: ListLeavePoliciesInput;
}

export interface ListLeavePoliciesForUiResult {
    policies: LeavePolicy[];
}

export async function listLeavePoliciesForUi(
    input: ListLeavePoliciesForUiInput,
): Promise<ListLeavePoliciesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.LEAVE_POLICY,
    });
    async function listPoliciesCached(
        cachedInput: ListLeavePoliciesForUiInput,
    ): Promise<ListLeavePoliciesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listLeavePolicies(
            { leavePolicyRepository: createLeavePolicyRepository() },
            { authorization: cachedInput.authorization, payload: cachedInput.payload },
        );

        return { policies: result.policies };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const result = await listLeavePolicies(
            { leavePolicyRepository: createLeavePolicyRepository() },
            { authorization: input.authorization, payload: input.payload },
        );

        return { policies: result.policies };
    }

    return listPoliciesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
