import { ValidationError } from '@/server/errors';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    acknowledgeHrPolicyPayloadSchema,
} from '@/server/services/hr/policies/hr-policy-schemas';
import type { PolicyAcknowledgment } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';

import { isRecord } from './utils';

export interface AcknowledgeHrPolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface AcknowledgeHrPolicyControllerResult {
    success: true;
    acknowledgment: PolicyAcknowledgment;
}

function getSessionUserId(session: Awaited<ReturnType<typeof getSessionContext>>['session']): string {
    const userId = session.user.id;
    if (!userId) {
        throw new ValidationError('Authenticated user id is missing from the session.');
    }
    return userId;
}

export async function acknowledgeHrPolicyController(
    controllerInput: AcknowledgeHrPolicyControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<AcknowledgeHrPolicyControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const policyId = typeof raw.policyId === 'string' ? raw.policyId : '';

    const { authorization, session } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: HR_PERMISSION_PROFILE.POLICY_ACKNOWLEDGE,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.ACKNOWLEDGE,
        resourceType: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
        resourceAttributes: { policyId },
    });

    const sessionUserId = getSessionUserId(session);
    const requestUserId = typeof raw.userId === 'string' ? raw.userId : sessionUserId;
    if (requestUserId !== sessionUserId) {
        throw new ValidationError('Cannot acknowledge a policy for a different user.');
    }

    const parsed = acknowledgeHrPolicyPayloadSchema.safeParse({
        ...raw,
        userId: sessionUserId,
    });

    if (!parsed.success) {
        throw parsed.error;
    }

    const payload = parsed.data;

    const acknowledgment = await resolved.service.acknowledgePolicy({
        authorization,
        userId: payload.userId,
        policyId: payload.policyId,
        version: payload.version,
        acknowledgedAt: payload.acknowledgedAt,
        ipAddress: payload.ipAddress,
        metadata: payload.metadata,
    });

    return { success: true, acknowledgment };
}
// API adapter: Use-case: acknowledge an HR policy via policy acknowledgment repositories with guard enforcement.
