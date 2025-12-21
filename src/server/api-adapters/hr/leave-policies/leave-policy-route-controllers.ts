import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';

import {
    createLeavePolicyController,
    deleteLeavePolicyController,
    listLeavePoliciesController,
    updateLeavePolicyController,
} from '@/server/api-adapters/hr/leave-policies';

import { isRecord } from './utils';

const POLICY_ID_REQUIRED_MESSAGE = 'Policy id is required.';

export async function listLeavePoliciesRouteController(request: Request) {
    const url = new URL(request.url);
    const orgId = url.searchParams.get('orgId') ?? '';

    return listLeavePoliciesController({
        headers: request.headers,
        input: { orgId },
        auditSource: 'api:hr:leave-policies:list',
    });
}

export async function createLeavePolicyRouteController(request: Request) {
    return createLeavePolicyController({
        headers: request.headers,
        input: await readJson(request),
        auditSource: 'api:hr:leave-policies:create',
    });
}

export async function updateLeavePolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return updateLeavePolicyController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            policyId,
        },
        auditSource: 'api:hr:leave-policies:update',
    });
}

export async function deleteLeavePolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return deleteLeavePolicyController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            policyId,
        },
        auditSource: 'api:hr:leave-policies:delete',
    });
}
