import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetTimeEntriesForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
}

export interface GetTimeEntriesForUiResult {
    entries: TimeEntry[];
}

export async function getTimeEntriesForUi(
    input: GetTimeEntriesForUiInput,
): Promise<GetTimeEntriesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.TIME_ENTRY,
        payload: {
            userId: input.userId ?? null,
        },
    });
    async function getTimeEntriesCached(
        cachedInput: GetTimeEntriesForUiInput,
    ): Promise<GetTimeEntriesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getTimeTrackingService();
        const result = await service.listTimeEntries({
            authorization: cachedInput.authorization,
            filters: { userId: cachedInput.userId },
        });

        return { entries: result.entries };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getTimeTrackingService();
        const result = await service.listTimeEntries({
            authorization: input.authorization,
            filters: { userId: input.userId },
        });

        return { entries: result.entries };
    }

    return getTimeEntriesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
