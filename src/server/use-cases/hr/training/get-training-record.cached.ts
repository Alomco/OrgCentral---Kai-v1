import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { TrainingRecord } from '@/server/types/hr-types';
import { getTrainingService } from '@/server/services/hr/training/training-service.provider';

export interface GetTrainingRecordForUiInput {
    authorization: RepositoryAuthorizationContext;
    recordId: string;
}

export interface GetTrainingRecordForUiResult {
    record: TrainingRecord;
}

export async function getTrainingRecordForUi(
    input: GetTrainingRecordForUiInput,
): Promise<GetTrainingRecordForUiResult> {
    async function getTrainingRecordCached(
        cachedInput: GetTrainingRecordForUiInput,
    ): Promise<GetTrainingRecordForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getTrainingService();
        const result = await service.getTrainingRecord({
            authorization: cachedInput.authorization,
            recordId: cachedInput.recordId,
        });

        return { record: result.record };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getTrainingService();
        const result = await service.getTrainingRecord({
            authorization: input.authorization,
            recordId: input.recordId,
        });

        return { record: result.record };
    }

    return getTrainingRecordCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
