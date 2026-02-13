import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { getAbsenceService } from '@/server/services/hr/absences/absence-service.provider';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetAbsencesForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
    includeClosed?: boolean;
}

export interface GetAbsencesForUiResult {
    absences: UnplannedAbsence[];
}

export async function getAbsencesForUi(
    input: GetAbsencesForUiInput,
): Promise<GetAbsencesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ABSENCE,
        payload: {
            userId: input.userId ?? null,
            includeClosed: input.includeClosed ?? null,
        },
    });
    async function getAbsencesCached(
        cachedInput: GetAbsencesForUiInput,
    ): Promise<GetAbsencesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getAbsenceService();
        const result = await service.listAbsences({
            authorization: cachedInput.authorization,
            filters: {
                userId: cachedInput.userId,
                includeClosed: cachedInput.includeClosed,
            },
        });

        return { absences: result.absences };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getAbsenceService();
        const result = await service.listAbsences({
            authorization: input.authorization,
            filters: {
                userId: input.userId,
                includeClosed: input.includeClosed,
            },
        });

        return { absences: result.absences };
    }

    return getAbsencesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
