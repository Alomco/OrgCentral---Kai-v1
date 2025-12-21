import { getSessionContext } from '../../../use-cases/auth/sessions/get-session';
import { listPolicyAcknowledgmentsPayloadSchema } from '../../../services/hr/policies/hr-policy-schemas';
import type { PolicyAcknowledgment } from '../../../types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface ListPolicyAcknowledgmentsControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface ListPolicyAcknowledgmentsControllerResult {
    success: true;
    acknowledgments: PolicyAcknowledgment[];
}

export async function listPolicyAcknowledgmentsController(
    controllerInput: ListPolicyAcknowledgmentsControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<ListPolicyAcknowledgmentsControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const rawPolicyId = typeof raw.policyId === 'string' ? raw.policyId : '';

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { policyId: rawPolicyId },
    });

    const payload = listPolicyAcknowledgmentsPayloadSchema.parse(controllerInput.input);

    const acknowledgments = await resolved.service.listPolicyAcknowledgments({
        authorization,
        policyId: payload.policyId,
        version: payload.version,
    });

    return { success: true, acknowledgments };
}

// API adapter: Use-case: list policy acknowledgments for a policy using acknowledgment repositories.
