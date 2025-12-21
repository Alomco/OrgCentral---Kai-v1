import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    acknowledgeHrPolicyRouteController,
    getPolicyAcknowledgmentRouteController,
} from '@/server/api-adapters/hr/policies/acknowledgment-route-controllers';

interface RouteParams {
    params: {
        policyId: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await getPolicyAcknowledgmentRouteController(request, params.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await acknowledgeHrPolicyRouteController(request, params.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
