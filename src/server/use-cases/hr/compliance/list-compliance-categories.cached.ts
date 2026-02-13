import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceCategory } from '@/server/types/compliance-types';
import { listComplianceCategories } from './list-compliance-categories';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

export interface ListComplianceCategoriesForUiInput {
    authorization: RepositoryAuthorizationContext;
}

export interface ListComplianceCategoriesForUiResult {
    categories: ComplianceCategory[];
}

function resolveDependencies() {
    const { complianceCategoryRepository } = buildComplianceRepositoryDependencies();
    return { complianceCategoryRepository };
}

export async function listComplianceCategoriesForUi(
    input: ListComplianceCategoriesForUiInput,
): Promise<ListComplianceCategoriesForUiResult> {
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_TEMPLATE,
    });
    async function listCategoriesCached(
        cachedInput: ListComplianceCategoriesForUiInput,
    ): Promise<ListComplianceCategoriesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const categories = await listComplianceCategories(resolveDependencies(), cachedInput);

        return { categories };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const categories = await listComplianceCategories(resolveDependencies(), input);

        return { categories };
    }

    return listCategoriesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
