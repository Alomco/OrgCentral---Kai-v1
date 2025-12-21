import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getHrPolicyPayloadSchema } from '@/server/services/hr/policies/hr-policy-schemas';
import type { HRPolicy } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface GetHrPolicyControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface GetHrPolicyControllerResult {
    success: true;
    policy: HRPolicy | null;
}

export async function getHrPolicyController(
    controllerInput: GetHrPolicyControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<GetHrPolicyControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const rawPolicyId = typeof raw.policyId === 'string' ? raw.policyId : '';

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: { policyId: rawPolicyId },
    });

    const payload = getHrPolicyPayloadSchema.parse(controllerInput.input);

    const policy = await resolved.service.getPolicy({ authorization, policyId: payload.policyId });
    return { success: true, policy };
}
// API adapter: Use-case: retrieve a specific HR policy via HR policy repositories under tenant scope.
