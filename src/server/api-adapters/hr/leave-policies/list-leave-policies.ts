import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listLeavePoliciesPayloadSchema } from '@/server/services/hr/leave-policies/leave-policy-schemas';
import type { LeavePolicy } from '@/server/types/leave-types';

import {
    defaultLeavePolicyControllerDependencies,
    HR_LEAVE_POLICY_RESOURCE_POLICY,
    resolveLeavePolicyControllerDependencies,
    type LeavePolicyControllerDependencies,
} from './common';

export interface ListLeavePoliciesControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface ListLeavePoliciesControllerResult {
    success: true;
    policies: LeavePolicy[];
}

export async function listLeavePoliciesController(
    controllerInput: ListLeavePoliciesControllerInput,
    dependencies: LeavePolicyControllerDependencies = defaultLeavePolicyControllerDependencies,
): Promise<ListLeavePoliciesControllerResult> {
    const resolved = resolveLeavePolicyControllerDependencies(dependencies);

    const payload = listLeavePoliciesPayloadSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: HR_LEAVE_POLICY_RESOURCE_POLICY,
        resourceAttributes: {
            orgId: payload.orgId,
        },
    });

    const policies = await resolved.service.listLeavePolicies({ authorization, payload });
    return { success: true, policies };
}
