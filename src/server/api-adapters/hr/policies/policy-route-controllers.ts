import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';

import {
    assignHrPolicyController,
    createHrPolicyController,
    getHrPolicyController,
    listHrPoliciesController,
    updateHrPolicyController,
} from '@/server/api-adapters/hr/policies';

import { isRecord } from './utils';

const POLICY_ID_REQUIRED_MESSAGE = 'Policy id is required.';

export function listHrPoliciesRouteController(request: Request) {
    const url = new URL(request.url);

    const status = url.searchParams.get('status') ?? undefined;
    const category = url.searchParams.get('category') ?? undefined;
    const filters = status || category ? { status, category } : undefined;

    return listHrPoliciesController({
        headers: request.headers,
        input: { filters },
        auditSource: 'api:hr:policies:list',
    });
}

export async function createHrPolicyRouteController(request: Request) {
    return createHrPolicyController({
        headers: request.headers,
        input: await readJson(request),
        auditSource: 'api:hr:policies:create',
    });
}

export function getHrPolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    return getHrPolicyController({
        headers: request.headers,
        input: { policyId },
        auditSource: 'api:hr:policies:get',
    });
}

export async function updateHrPolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return updateHrPolicyController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            policyId,
        },
        auditSource: 'api:hr:policies:update',
    });
}

export async function assignHrPolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return assignHrPolicyController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            policyId,
        },
        auditSource: 'api:hr:policies:assign',
    });
}
