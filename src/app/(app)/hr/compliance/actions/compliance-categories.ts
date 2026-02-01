'use server';

import { headers } from 'next/headers';
import { upsertComplianceCategorySchema } from '@/server/types/hr-compliance-schemas';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { upsertComplianceCategory } from '@/server/use-cases/hr/compliance/upsert-compliance-category';
import { resolveComplianceControllerDependencies } from '@/server/api-adapters/hr/compliance/common';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { ComplianceCategoryActionState } from './compliance-categories.types';

export async function saveComplianceCategoryAction(
    _previous: ComplianceCategoryActionState,
    formData: FormData,
): Promise<ComplianceCategoryActionState> {
    void _previous;
    const headerStore = await headers();

    const parsed = upsertComplianceCategorySchema.safeParse({
        key: formData.get('category-key') ?? '',
        label: formData.get('category-label') ?? '',
        sortOrder: formData.get('category-sort-order') ?? 100,
        regulatoryRefs: formData.getAll('category-regulatory-ref').filter((value) => typeof value === 'string'),
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid category input.' };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:hr:compliance:categories:upsert',
            action: 'update',
            resourceType: 'hr.compliance',
            resourceAttributes: { key: parsed.data.key },
        },
    );

    const { complianceCategoryRepository } = resolveComplianceControllerDependencies();

    const category = await upsertComplianceCategory(
        { complianceCategoryRepository },
        {
            orgId: authorization.orgId,
            key: parsed.data.key,
            label: parsed.data.label,
            sortOrder: parsed.data.sortOrder ?? 100,
            metadata: {
                regulatoryRefs: parsed.data.regulatoryRefs ?? [],
            },
        },
    );

    await recordAuditEvent({
        orgId: authorization.orgId,
        userId: authorization.userId,
        eventType: 'POLICY_CHANGE',
        action: 'hr.compliance.category.upserted',
        resource: 'hr.compliance.category',
        resourceId: category.id,
        residencyZone: authorization.dataResidency,
        classification: authorization.dataClassification,
        auditSource: authorization.auditSource,
        payload: {
            key: category.key,
            label: category.label,
            sortOrder: category.sortOrder,
            regulatoryRefs: parsed.data.regulatoryRefs ?? [],
        },
    });

    return {
        status: 'success',
        message: 'Category saved.',
        category,
    };
}
