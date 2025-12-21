import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { updateHrPolicyPayloadSchema } from '@/server/services/hr/policies/hr-policy-schemas';
import type { HRPolicy } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { coerceOptionalDate, coerceOptionalNullableDate } from './utils';
import { isRecord } from './utils';

export interface UpdateHrPolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface UpdateHrPolicyControllerResult {
    success: true;
    policy: HRPolicy;
}

export async function updateHrPolicyController(
    controllerInput: UpdateHrPolicyControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<UpdateHrPolicyControllerResult> {
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

    const payload = updateHrPolicyPayloadSchema.parse(controllerInput.input);

    const updates = {
        ...payload.updates,
        effectiveDate: coerceOptionalDate(payload.updates.effectiveDate),
        expiryDate: coerceOptionalNullableDate(payload.updates.expiryDate),
    };

    const policy = await resolved.service.updatePolicy({
        authorization,
        policyId: payload.policyId,
        updates,
    });

    return { success: true, policy };
}
// API adapter: Use-case: update an HR policy using HR policy repositories under guard control.
