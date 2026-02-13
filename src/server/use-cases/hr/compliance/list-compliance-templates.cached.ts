import { cacheLife, unstable_noStore as noStore } from 'next/cache';

import { CACHE_LIFE_SHORT } from '@/server/repositories/cache-profiles';
import { buildComplianceRepositoryDependencies } from '@/server/repositories/providers/hr/compliance-repository-dependencies';
import { toCacheSafeAuthorizationContext } from '@/server/repositories/security/cache-authorization';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions/resources';
import type { ComplianceTemplate } from '@/server/types/compliance-types';
import { listComplianceTemplates } from './list-compliance-templates';
import { recordHrCachedReadAudit } from '@/server/use-cases/hr/audit/record-hr-cached-read-audit';

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
    await recordHrCachedReadAudit({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resource: HR_RESOURCE_TYPE.COMPLIANCE_TEMPLATE,
    });
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
