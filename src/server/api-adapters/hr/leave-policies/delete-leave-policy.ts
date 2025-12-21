import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { deleteLeavePolicyPayloadSchema } from '@/server/services/hr/leave-policies/leave-policy-schemas';
import { ValidationError } from '@/server/errors';

import {
    defaultLeavePolicyControllerDependencies,
    HR_LEAVE_POLICY_RESOURCE_POLICY,
    resolveLeavePolicyControllerDependencies,
    type LeavePolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface DeleteLeavePolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface DeleteLeavePolicyControllerResult {
    success: true;
}

export async function deleteLeavePolicyController(
    controllerInput: DeleteLeavePolicyControllerInput,
    dependencies: LeavePolicyControllerDependencies = defaultLeavePolicyControllerDependencies,
): Promise<DeleteLeavePolicyControllerResult> {
    const resolved = resolveLeavePolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const policyId = typeof raw.policyId === 'string' ? raw.policyId : '';
    if (!policyId) {
        throw new ValidationError('Policy id is required.');
    }

    const payload = deleteLeavePolicyPayloadSchema.parse(controllerInput.input);

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'delete',
        resourceType: HR_LEAVE_POLICY_RESOURCE_POLICY,
        resourceAttributes: {
            orgId: payload.orgId,
            policyId,
        },
    });

    await resolved.service.deleteLeavePolicy({
        authorization,
        payload: {
            orgId: payload.orgId,
            policyId,
        },
    });

    return { success: true };
}
