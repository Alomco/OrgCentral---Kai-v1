import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { getLeaveService } from '@/server/services/hr/leave/leave-service.provider';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveBalance } from '@/server/types/leave-types';

export interface GetLeaveBalanceForUiInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
    year?: number;
}

export interface GetLeaveBalanceForUiResult {
    balances: LeaveBalance[];
    employeeId: string;
    year?: number;
}

export async function getLeaveBalanceForUi(
    input: GetLeaveBalanceForUiInput,
): Promise<GetLeaveBalanceForUiResult> {
    async function getBalanceCached(
        cachedInput: GetLeaveBalanceForUiInput,
    ): Promise<GetLeaveBalanceForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getLeaveService();
        const result = await service.getLeaveBalance({
            authorization: cachedInput.authorization,
            employeeId: cachedInput.employeeId,
            year: cachedInput.year,
        });

        return result;
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getLeaveService();
        return service.getLeaveBalance({
            authorization: input.authorization,
            employeeId: input.employeeId,
            year: input.year,
        });
    }

    return getBalanceCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
