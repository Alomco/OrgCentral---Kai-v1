import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    assignComplianceItems,
    type AssignComplianceItemsDependencies,
} from '@/server/use-cases/hr/compliance/assign-compliance-items';
import { assignComplianceItemsSchema } from '@/server/types/hr-compliance-schemas';
import { HR_ACTION, HR_ANY_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import type { ComplianceControllerDependencies } from './common';
import { resolveComplianceControllerDependencies, readJson } from './common';

export interface AssignComplianceItemsControllerResult {
    success: true;
    templateId: string;
    userCount: number;
}

export async function assignComplianceItemsController(
    request: Request,
    dependencies?: ComplianceControllerDependencies,
): Promise<AssignComplianceItemsControllerResult> {
    const payload = assignComplianceItemsSchema.parse(await readJson(request));
    const { session, assignmentService } = resolveComplianceControllerDependencies(dependencies);

    const { authorization } = await getSessionContext(session, {
        headers: request.headers,
        requiredAnyPermissions: HR_ANY_PERMISSION_PROFILE.COMPLIANCE_MANAGEMENT,
        auditSource: 'api:hr:compliance:assign',
        action: HR_ACTION.ASSIGN,
        resourceType: HR_RESOURCE_TYPE.COMPLIANCE_ITEM,
        resourceAttributes: {
            templateId: payload.templateId,
            userIds: payload.userIds,
        },
    });

    const useCaseDeps: AssignComplianceItemsDependencies = { assignmentService };
    await assignComplianceItems(useCaseDeps, { ...payload, authorization });

    return {
        success: true,
        templateId: payload.templateId,
        userCount: payload.userIds.length,
    };
}
