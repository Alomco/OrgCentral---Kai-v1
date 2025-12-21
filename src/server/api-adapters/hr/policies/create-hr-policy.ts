import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { createHrPolicyPayloadSchema } from '@/server/services/hr/policies/hr-policy-schemas';
import type { HRPolicy } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { coerceDate, coerceOptionalNullableDate } from './utils';
import { isRecord } from './utils';

export interface CreateHrPolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface CreateHrPolicyControllerResult {
    success: true;
    policy: HRPolicy;
}

export async function createHrPolicyController(
    controllerInput: CreateHrPolicyControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<CreateHrPolicyControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const rawPolicy = isRecord(raw.policy) ? raw.policy : {};
    const rawCategory = typeof rawPolicy.category === 'string' ? rawPolicy.category : undefined;

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { organization: ['update'] },
        auditSource: controllerInput.auditSource,
        action: 'create',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { category: rawCategory },
    });

    const payload = createHrPolicyPayloadSchema.parse(controllerInput.input);

    const effectiveDate = coerceDate(payload.policy.effectiveDate);
    const expiryDate = coerceOptionalNullableDate(payload.policy.expiryDate);

    const policy = await resolved.service.createPolicy({
        authorization,
        policy: {
            ...payload.policy,
            effectiveDate,
            expiryDate,
        },
    });
    return { success: true, policy };
}
// API adapter: Use-case: create an HR policy via HR policy repositories with authorization.
