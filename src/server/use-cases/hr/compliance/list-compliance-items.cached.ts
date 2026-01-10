import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { listComplianceItems } from './list-compliance-items';

export interface ListComplianceItemsForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
}

export interface ListComplianceItemsForUiResult {
    items: ComplianceLogItem[];
}

function resolveComplianceItemRepository(): PrismaComplianceItemRepository {
    return new PrismaComplianceItemRepository();
}

export async function listComplianceItemsForUi(
    input: ListComplianceItemsForUiInput,
): Promise<ListComplianceItemsForUiResult> {
    async function listItemsCached(
        cachedInput: ListComplianceItemsForUiInput,
    ): Promise<ListComplianceItemsForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const items = await listComplianceItems(
            { complianceItemRepository: resolveComplianceItemRepository() },
            cachedInput,
        );

        return { items };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const items = await listComplianceItems(
            { complianceItemRepository: resolveComplianceItemRepository() },
            input,
        );

        return { items };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
