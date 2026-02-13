import { getSessionContext } from '../../../use-cases/auth/sessions/get-session';
import { listPolicyAcknowledgmentsPayloadSchema } from '../../../services/hr/policies/hr-policy-schemas';
import type { PolicyAcknowledgment } from '../../../types/hr-ops-types';

import {
    defaultHrPolicyControllerDependencies,
    resolveHrPolicyControllerDependencies,
    type HrPolicyControllerDependencies,
} from './common';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';

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
        requiredPermissions: HR_PERMISSION_PROFILE.POLICY_ACKNOWLEDGMENT_LIST,
        auditSource: controllerInput.auditSource,
        action: HR_ACTION.LIST,
        resourceType: HR_RESOURCE_TYPE.POLICY_ACKNOWLEDGMENT,
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
