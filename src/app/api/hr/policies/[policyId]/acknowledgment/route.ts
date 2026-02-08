import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    acknowledgeHrPolicyRouteController,
    getPolicyAcknowledgmentRouteController,
} from '@/server/api-adapters/hr/policies/acknowledgment-route-controllers';

interface RouteParams {
    params: Promise<{
        policyId: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await getPolicyAcknowledgmentRouteController(request, resolvedParams.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await acknowledgeHrPolicyRouteController(request, resolvedParams.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
