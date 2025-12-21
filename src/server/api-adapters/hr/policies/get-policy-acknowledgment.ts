import { ValidationError } from '@/server/errors';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getHrPolicyAcknowledgmentPayloadSchema } from '@/server/services/hr/policies/hr-policy-schemas';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface GetPolicyAcknowledgmentControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface GetPolicyAcknowledgmentControllerResult {
    success: true;
    acknowledgment: PolicyAcknowledgment | null;
}

export async function getPolicyAcknowledgmentController(
    controllerInput: GetPolicyAcknowledgmentControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<GetPolicyAcknowledgmentControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);
    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const policyId = typeof raw.policyId === 'string' ? raw.policyId : '';

    const { authorization, session } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { policyId },
    });

    const sessionUserId = session.user.id;
    const requestedUserId = typeof raw.userId === 'string' ? raw.userId : sessionUserId;
    if (requestedUserId !== sessionUserId) {
        throw new ValidationError('Cannot read a policy acknowledgment for a different user.');
    }

    const payload = getHrPolicyAcknowledgmentPayloadSchema.parse({
        ...raw,
        userId: requestedUserId,
    });

    const acknowledgment = await resolved.service.getPolicyAcknowledgment({
        authorization,
        userId: payload.userId,
        policyId: payload.policyId,
    });

    return { success: true, acknowledgment };
}
// API adapter: Use-case: get a specific policy acknowledgment by policy/user/version via acknowledgment repositories.
