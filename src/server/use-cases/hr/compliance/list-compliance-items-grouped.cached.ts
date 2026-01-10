import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance';
import { PrismaComplianceCategoryRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-category-repository';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceItemsGroup } from './list-compliance-items-grouped';
import { listComplianceItemsGrouped } from './list-compliance-items-grouped';

export interface ListComplianceItemsGroupedForUiInput {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    uncategorizedLabel?: string;
}

export interface ListComplianceItemsGroupedForUiResult {
    groups: ComplianceItemsGroup[];
}

function resolveDependencies() {
    return {
        complianceItemRepository: new PrismaComplianceItemRepository(),
        complianceCategoryRepository: new PrismaComplianceCategoryRepository(),
    };
}

export async function listComplianceItemsGroupedForUi(
    input: ListComplianceItemsGroupedForUiInput,
): Promise<ListComplianceItemsGroupedForUiResult> {
    async function listItemsCached(
        cachedInput: ListComplianceItemsGroupedForUiInput,
    ): Promise<ListComplianceItemsGroupedForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const groups = await listComplianceItemsGrouped(resolveDependencies(), cachedInput);
        return { groups };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const groups = await listComplianceItemsGrouped(resolveDependencies(), input);
        return { groups };
    }

    return listItemsCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
