import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { listHrPoliciesPayloadSchema } from '@/server/services/hr/policies/hr-policy-schemas';
import type { HRPolicy } from '@/server/types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    HR_POLICY_RESOURCE_POLICY,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';

import { isRecord } from './utils';

export interface ListHrPoliciesControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

export interface ListHrPoliciesControllerResult {
    success: true;
    policies: HRPolicy[];
}

export async function listHrPoliciesController(
    controllerInput: ListHrPoliciesControllerInput,
    dependencies: HrPolicyControllerDependencies = defaultHrPolicyControllerDependencies,
): Promise<ListHrPoliciesControllerResult> {
    const resolved = resolveHrPolicyControllerDependencies(dependencies);

    const raw = isRecord(controllerInput.input) ? controllerInput.input : {};
    const rawFilters = isRecord(raw.filters) ? raw.filters : {};
    const rawCategory = typeof rawFilters.category === 'string' ? rawFilters.category : undefined;
    const rawStatus = typeof rawFilters.status === 'string' ? rawFilters.status : undefined;

    const { authorization } = await getSessionContext(resolved.session, {
        headers: controllerInput.headers,
        requiredPermissions: { employeeProfile: ['read'] },
        auditSource: controllerInput.auditSource,
        action: 'read',
        resourceType: HR_POLICY_RESOURCE_POLICY,
        resourceAttributes: {
            category: rawCategory,
            status: rawStatus,
        },
    });

    const payload = listHrPoliciesPayloadSchema.parse(controllerInput.input);

    const policies = await resolved.service.listPolicies({ authorization, filters: payload.filters });
    return { success: true, policies };
}
// API adapter: Use-case: list HR policies for an organization using HR policy repositories with filters.
