import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    listComplianceItemsGrouped,
    type ListComplianceItemsGroupedDependencies,
} from '@/server/use-cases/hr/compliance/list-compliance-items-grouped';
import { listComplianceItemsGroupedQuerySchema } from '@/server/types/hr-compliance-schemas';
import { HR_ACTION, HR_ANY_PERMISSION_PROFILE, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import type { ComplianceControllerDependencies } from './common';
import { resolveComplianceControllerDependencies } from './common';

export interface ListComplianceItemsGroupedControllerResult {
    success: true;
    groups: Awaited<ReturnType<typeof listComplianceItemsGrouped>>;
}

export async function listComplianceItemsGroupedController(
    request: Request,
    dependencies?: ComplianceControllerDependencies,
): Promise<ListComplianceItemsGroupedControllerResult> {
    const { session, complianceItemRepository, complianceCategoryRepository } = resolveComplianceControllerDependencies(
        dependencies,
    );
    const query = listComplianceItemsGroupedQuerySchema.parse({
        userId: new URL(request.url).searchParams.get('userId') ?? undefined,
    });
    const targetUserId = query.userId;

    const baseAccess = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.COMPLIANCE_LIST,
        auditSource: 'api:hr:compliance:list-grouped',
        action: HR_ACTION.LIST,
        resourceType: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
        resourceAttributes: {
            targetUserId,
        },
    });

    let authorization = baseAccess.authorization;
    const resolvedUserId = targetUserId ?? authorization.userId;

    if (resolvedUserId !== authorization.userId) {
        const elevated = await getSessionContext(session, {
            headers: request.headers,
            requiredAnyPermissions: HR_ANY_PERMISSION_PROFILE.COMPLIANCE_MANAGEMENT,
            auditSource: 'api:hr:compliance:list-grouped.elevated',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
            resourceAttributes: {
                targetUserId: resolvedUserId,
            },
        });
        authorization = elevated.authorization;
    }

    const useCaseDeps: ListComplianceItemsGroupedDependencies = {
        complianceItemRepository,
        complianceCategoryRepository,
    };
    const groups = await listComplianceItemsGrouped(useCaseDeps, {
        authorization,
        userId: resolvedUserId,
    });

    return {
        success: true,
        groups,
    };
}
