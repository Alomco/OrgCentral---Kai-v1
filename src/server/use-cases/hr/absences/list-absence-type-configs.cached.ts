import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbsenceTypeConfig } from '@/server/types/hr-ops-types';
import { buildAbsenceServiceDependencies } from '@/server/repositories/providers/hr/absence-service-dependencies';

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
