import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ComplianceTemplate } from '@/server/types/compliance-types';
import { listComplianceTemplates } from './list-compliance-templates';

export interface ListComplianceTemplatesForUiInput {
    authorization: RepositoryAuthorizationContext;
}

export interface ListComplianceTemplatesForUiResult {
    templates: ComplianceTemplate[];
}

function resolveDependencies() {
    const { complianceTemplateRepository } = buildComplianceRepositoryDependencies();
    return { complianceTemplateRepository };
}

export async function listComplianceTemplatesForUi(
    input: ListComplianceTemplatesForUiInput,
): Promise<ListComplianceTemplatesForUiResult> {
    async function listTemplatesCached(
        cachedInput: ListComplianceTemplatesForUiInput,
    ): Promise<ListComplianceTemplatesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const templates = await listComplianceTemplates(resolveDependencies(), cachedInput);

        return { templates };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const templates = await listComplianceTemplates(resolveDependencies(), input);

        return { templates };
    }

    return listTemplatesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
