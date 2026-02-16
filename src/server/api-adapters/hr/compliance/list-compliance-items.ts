import type { ComplianceLogItem } from '@/server/types/compliance-types';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    listComplianceItems,
    type ListComplianceItemsDependencies,
} from '@/server/use-cases/hr/compliance/list-compliance-items';
import { listComplianceItemsQuerySchema } from '@/server/types/hr-compliance-schemas';
import { HR_ACTION, HR_ANY_PERMISSION_PROFILE, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import type { ComplianceControllerDependencies } from './common';
import { resolveComplianceControllerDependencies } from './common';

export interface ListComplianceItemsControllerResult {
    success: true;
    items: ComplianceLogItem[];
}

export async function listComplianceItemsController(
    request: Request,
    dependencies?: ComplianceControllerDependencies,
): Promise<ListComplianceItemsControllerResult> {
    const { session, complianceItemRepository } = resolveComplianceControllerDependencies(dependencies);
    const query = listComplianceItemsQuerySchema.parse({
        userId: new URL(request.url).searchParams.get('userId') ?? undefined,
    });
    const targetUserId = query.userId;

    const baseAccess = await getSessionContext(session, {
        headers: request.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.COMPLIANCE_LIST,
        auditSource: 'api:hr:compliance:list',
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
            auditSource: 'api:hr:compliance:list.elevated',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
            resourceAttributes: {
                targetUserId: resolvedUserId,
            },
        });
        authorization = elevated.authorization;
    }

    const useCaseDeps: ListComplianceItemsDependencies = { complianceItemRepository };
    const items = await listComplianceItems(useCaseDeps, {
        authorization,
        userId: resolvedUserId,
    });

    return {
        success: true,
        items,
    };
}
