import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { getComplianceStatusService } from '@/server/services/hr/compliance/compliance-status.service.provider';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceStatusSnapshot } from '@/server/repositories/contracts/hr/compliance/compliance-status-repository-contract';

export interface GetComplianceStatusForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
}

export interface GetComplianceStatusForUiResult {
    snapshot: ComplianceStatusSnapshot | null;
}

export async function getComplianceStatusForUi(
    input: GetComplianceStatusForUiInput,
): Promise<GetComplianceStatusForUiResult> {
    async function getStatusCached(
        cachedInput: GetComplianceStatusForUiInput,
    ): Promise<GetComplianceStatusForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const service = getComplianceStatusService();
        const snapshot = await service.getStatusForUser(
            cachedInput.authorization,
            cachedInput.userId,
        );

        return { snapshot };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const service = getComplianceStatusService();
        const snapshot = await service.getStatusForUser(
            input.authorization,
            input.userId,
        );

        return { snapshot };
    }

    return getStatusCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
