import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { TimeEntry } from '@/server/types/hr-ops-types';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';

export interface GetTimeEntryForUiInput {
    authorization: RepositoryAuthorizationContext;
    entryId: string;
}

export interface GetTimeEntryForUiResult {
    entry: TimeEntry | null;
}

export async function getTimeEntryForUi(
    input: GetTimeEntryForUiInput,
): Promise<GetTimeEntryForUiResult> {
    async function getTimeEntryCached(
        cachedInput: GetTimeEntryForUiInput,
    ): Promise<GetTimeEntryForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getTimeTrackingService();
        const result = await service.getTimeEntry({
            authorization: cachedInput.authorization,
            entryId: cachedInput.entryId,
        });

        return { entry: result.entry };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getTimeTrackingService();
        const result = await service.getTimeEntry({
            authorization: input.authorization,
            entryId: input.entryId,
        });

        return { entry: result.entry };
    }

    return getTimeEntryCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
