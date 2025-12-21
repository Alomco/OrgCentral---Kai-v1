import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateLeavePolicyPayloadSchema } from '@/server/services/hr/leave-policies/leave-policy-schemas';
import type { LeavePolicy } from '@/server/types/leave-types';
import { ValidationError } from '@/server/errors';

import {
    defaultLeavePolicyControllerDependencies,
    HR_LEAVE_POLICY_RESOURCE_POLICY,
    resolveLeavePolicyControllerDependencies,
    type LeavePolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface UpdateLeavePolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface UpdateLeavePolicyControllerResult {
    success: true;
    policy: LeavePolicy;
}

export async function updateLeavePolicyController(
    controllerInput: UpdateLeavePolicyControllerInput,
    dependencies: LeavePolicyControllerDependencies = defaultLeavePolicyControllerDependencies,
): Promise<UpdateLeavePolicyControllerResult> {
    const resolved = resolveLeavePolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const policyId = typeof raw.policyId === 'string' ? raw.policyId : '';
    if (!policyId) {
        throw new ValidationError('Policy id is required.');
    }

    const payload = updateLeavePolicyPayloadSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: HR_LEAVE_POLICY_RESOURCE_POLICY,
        resourceAttributes: {
            orgId: payload.orgId,
            policyId,
        },
    });

    const policy = await resolved.service.updateLeavePolicy({
        authorization,
        orgId: payload.orgId,
        policyId,
        patch: payload.patch,
    });

    return { success: true, policy };
}
