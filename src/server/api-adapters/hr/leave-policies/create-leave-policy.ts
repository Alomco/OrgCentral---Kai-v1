import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createLeavePolicyPayloadSchema } from '@/server/services/hr/leave-policies/leave-policy-schemas';
import type { LeavePolicy } from '@/server/types/leave-types';

import {
    defaultLeavePolicyControllerDependencies,
    HR_LEAVE_POLICY_RESOURCE_POLICY,
    resolveLeavePolicyControllerDependencies,
    type LeavePolicyControllerDependencies,
} from './common';

export interface CreateLeavePolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface CreateLeavePolicyControllerResult {
    success: true;
    policy: LeavePolicy;
}

export async function createLeavePolicyController(
    controllerInput: CreateLeavePolicyControllerInput,
    dependencies: LeavePolicyControllerDependencies = defaultLeavePolicyControllerDependencies,
): Promise<CreateLeavePolicyControllerResult> {
    const resolved = resolveLeavePolicyControllerDependencies(dependencies);

    const payload = createLeavePolicyPayloadSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'create',
        resourceType: HR_LEAVE_POLICY_RESOURCE_POLICY,
        resourceAttributes: {
            orgId: payload.policy.orgId,
        },
    });

    const policy = await resolved.service.createLeavePolicy({
        authorization,
        payload: {
            orgId: payload.policy.orgId,
            name: payload.policy.name,
            type: payload.policy.type,
            accrualAmount: payload.policy.accrualAmount,
        },
    });

    return { success: true, policy };
}
