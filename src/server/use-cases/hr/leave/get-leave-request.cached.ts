import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { EntityNotFoundError } from '@/server/errors';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { LeaveRequest } from '@/server/types/leave-types';
import type { LeaveRequestReadOptions } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetLeaveRequestForUiInput {
    authorization: RepositoryAuthorizationContext;
    requestId: string;
    options?: LeaveRequestReadOptions;
}

export interface GetLeaveRequestForUiResult {
    request: LeaveRequest | null;
    requestId: string;
}

export interface FetchLeaveRequestForUiResult {
    request: LeaveRequest;
}

async function executeGetLeaveRequest(
    input: GetLeaveRequestForUiInput,
): Promise<GetLeaveRequestForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.READ,
        resource: HR_RESOURCE_TYPE.LEAVE_REQUEST,
        resourceId: input.requestId,
    });
    async function getLeaveRequestCached(
        cachedInput: GetLeaveRequestForUiInput,
    ): Promise<GetLeaveRequestForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getLeaveService();
        return service.getLeaveRequest({
            authorization: cachedInput.authorization,
            requestId: cachedInput.requestId,
            options: cachedInput.options,
        });
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getLeaveService();
        return service.getLeaveRequest({
            authorization: input.authorization,
            requestId: input.requestId,
            options: input.options,
        });
    }

    return getLeaveRequestCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}

export async function getLeaveRequestForUi(
    input: GetLeaveRequestForUiInput,
): Promise<GetLeaveRequestForUiResult> {
    return executeGetLeaveRequest(input);
}

export async function fetchLeaveRequestForUi(
    input: GetLeaveRequestForUiInput,
): Promise<FetchLeaveRequestForUiResult> {
    const result = await executeGetLeaveRequest(input);

    if (!result.request) {
        throw new EntityNotFoundError('Leave request', { requestId: input.requestId });
    }

    return { request: result.request };
}
