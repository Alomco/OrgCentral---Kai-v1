import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';

import {
    acknowledgeHrPolicyController,
    getPolicyAcknowledgmentController,
    listPolicyAcknowledgmentsController,
} from '@/server/api-adapters/hr/policies';

import { isRecord } from './utils';

const POLICY_ID_REQUIRED_MESSAGE = 'Policy id is required.';

export function getPolicyAcknowledgmentRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    return getPolicyAcknowledgmentController({
        headers: request.headers,
        input: { policyId },
        auditSource: 'api:hr:policies:acknowledgment:get',
    });
}

export async function acknowledgeHrPolicyRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return acknowledgeHrPolicyController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            policyId,
        },
        auditSource: 'api:hr:policies:acknowledgment:create',
    });
}

export function listPolicyAcknowledgmentsRouteController(request: Request, policyId: string) {
    if (!policyId) {
        throw new ValidationError(POLICY_ID_REQUIRED_MESSAGE);
    }

    const url = new URL(request.url);
    const version = url.searchParams.get('version') ?? undefined;

    return listPolicyAcknowledgmentsController({
        headers: request.headers,
        input: { policyId, version },
        auditSource: 'api:hr:policies:acknowledgments:list',
    });
}
