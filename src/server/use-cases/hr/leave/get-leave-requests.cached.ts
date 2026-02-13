import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { LeaveRequest } from '@/server/types/leave-types';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetLeaveRequestsForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId?: string;
}

export interface GetLeaveRequestsForUiResult {
    requests: LeaveRequest[];
}

export async function getLeaveRequestsForUi(
    input: GetLeaveRequestsForUiInput,
): Promise<GetLeaveRequestsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.LEAVE_REQUEST,
        payload: {
            employeeId: input.employeeId ?? null,
        },
    });
    async function getLeaveRequestsCached(
        cachedInput: GetLeaveRequestsForUiInput,
    ): Promise<GetLeaveRequestsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getLeaveService();
        const result = await service.listLeaveRequests({
            authorization: cachedInput.authorization,
            employeeId: cachedInput.employeeId,
        });

        return { requests: result.requests };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getLeaveService();
        const result = await service.listLeaveRequests({
            authorization: input.authorization,
            employeeId: input.employeeId,
        });

        return { requests: result.requests };
    }

    return getLeaveRequestsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
