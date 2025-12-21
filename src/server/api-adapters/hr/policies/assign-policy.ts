import { getSessionContext } from '../../../use-cases/auth/sessions/get-session';
import { assignHrPolicyPayloadSchema } from '../../../services/hr/policies/hr-policy-schemas';
import type { HRPolicy } from '../../../types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface AssignHrPolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface AssignHrPolicyControllerResult {
    success: true;
    policy: HRPolicy;
}

export async function assignHrPolicyController(
    controllerInput: AssignHrPolicyControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<AssignHrPolicyControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const rawPolicyId = typeof raw.policyId === 'string' ? raw.policyId : '';

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'update',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { policyId: rawPolicyId },
    });

    const payload = assignHrPolicyPayloadSchema.parse(controllerInput.input);

    const policy = await resolved.service.updatePolicy({
        authorization,
        policyId: payload.policyId,
        updates: {
            applicableRoles: payload.assignment.applicableRoles,
            applicableDepartments: payload.assignment.applicableDepartments,
            requiresAcknowledgment: payload.assignment.requiresAcknowledgment,
        },
    });

    return { success: true, policy };
}

// API adapter: Use-case: assign an HR policy to an employee group using policy applicability fields with authorization.
