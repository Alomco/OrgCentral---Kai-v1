import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { PrismaComplianceTemplateRepository } from '@/server/repositories/prisma/hr/compliance';
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

function resolveComplianceTemplateRepository(): PrismaComplianceTemplateRepository {
    return new PrismaComplianceTemplateRepository();
}

export async function listComplianceTemplatesForUi(
    input: ListComplianceTemplatesForUiInput,
): Promise<ListComplianceTemplatesForUiResult> {
    async function listTemplatesCached(
        cachedInput: ListComplianceTemplatesForUiInput,
    ): Promise<ListComplianceTemplatesForUiResult> {
        'use cache';
        cacheLife(CACHE_LIFE_SHORT);

        const templates = await listComplianceTemplates(
            { complianceTemplateRepository: resolveComplianceTemplateRepository() },
            cachedInput,
        );

        return { templates };
    }

    if (input.authorization.dataClassification !== 'OFFICIAL') {
        noStore();

        const templates = await listComplianceTemplates(
            { complianceTemplateRepository: resolveComplianceTemplateRepository() },
            input,
        );

        return { templates };
    }

    return listTemplatesCached({
        ...input,
        authorization: toCacheSafeAuthorizationContext(input.authorization),
    });
}
