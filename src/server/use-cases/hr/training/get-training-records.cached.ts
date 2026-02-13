import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { TrainingRecord } from '@/server/types/hr-types';
import { getTrainingService } from '@/server/services/hr/training/training-service.provider';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface GetTrainingRecordsForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId?: string;
}

export interface GetTrainingRecordsForUiResult {
    records: TrainingRecord[];
}

export async function getTrainingRecordsForUi(
    input: GetTrainingRecordsForUiInput,
): Promise<GetTrainingRecordsForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.TRAINING_RECORD,
        payload: {
            userId: input.userId ?? null,
        },
    });
    async function getTrainingRecordsCached(
        cachedInput: GetTrainingRecordsForUiInput,
    ): Promise<GetTrainingRecordsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getTrainingService();
        const result = await service.listTrainingRecords({
            authorization: cachedInput.authorization,
            filters: { userId: cachedInput.userId },
        });

        return { records: result.records };
    }

    // Compliance rule: sensitive data is never cached.
    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getTrainingService();
        const result = await service.listTrainingRecords({
            authorization: input.authorization,
            filters: { userId: input.userId },
        });

        return { records: result.records };
    }

    return getTrainingRecordsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
