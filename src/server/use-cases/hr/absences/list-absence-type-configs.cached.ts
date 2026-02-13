import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';
import { buildAbsenceServiceDependencies } from '@/server/repositories/providers/hr/absence-service-dependencies';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

import { listAbsenceTypeConfigs } from './list-absence-type-configs';

export interface ListAbsenceTypeConfigsForUiInput {
    authorization: RepositoryAuthorizationContext;
    includeInactive?: boolean;
}

export interface ListAbsenceTypeConfigsForUiResult {
    types: AbsenceTypeConfig[];
}

function resolveDependencies() {
    const { typeConfigRepository } = buildAbsenceServiceDependencies();
    return { typeConfigRepository };
}

export async function listAbsenceTypeConfigsForUi(
    input: ListAbsenceTypeConfigsForUiInput,
): Promise<ListAbsenceTypeConfigsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.ABSENCE_SETTINGS,
        payload: {
            includeInactive: input.includeInactive ?? null,
        },
    });
    async function listCached(
        cachedInput: ListAbsenceTypeConfigsForUiInput,
    ): Promise<ListAbsenceTypeConfigsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const result = await listAbsenceTypeConfigs(
            resolveDependencies(),
            cachedInput,
        );

        return { types: result.types };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();
        const result = await listAbsenceTypeConfigs(
            resolveDependencies(),
            input,
        );
        return { types: result.types };
    }

    return listCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
