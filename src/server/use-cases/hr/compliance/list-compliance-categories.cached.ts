import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaComplianceCategoryRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-category-repository';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceCategory } from '@/server/types/compliance-types';
import { listComplianceCategories } from './list-compliance-categories';

export interface ListComplianceCategoriesForUiInput {
    authorization: RepositoryAuthorizationContext;
}

export interface ListComplianceCategoriesForUiResult {
    categories: ComplianceCategory[];
}

function resolveComplianceCategoryRepository(): PrismaComplianceCategoryRepository {
    return new PrismaComplianceCategoryRepository();
}

export async function listComplianceCategoriesForUi(
    input: ListComplianceCategoriesForUiInput,
): Promise<ListComplianceCategoriesForUiResult> {
    async function listCategoriesCached(
        cachedInput: ListComplianceCategoriesForUiInput,
    ): Promise<ListComplianceCategoriesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const categories = await listComplianceCategories(
            { complianceCategoryRepository: resolveComplianceCategoryRepository() },
            cachedInput,
        );

        return { categories };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const categories = await listComplianceCategories(
            { complianceCategoryRepository: resolveComplianceCategoryRepository() },
            input,
        );

        return { categories };
    }

    return listCategoriesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
