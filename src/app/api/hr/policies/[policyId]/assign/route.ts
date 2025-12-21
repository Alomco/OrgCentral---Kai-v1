import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { assignHrPolicyRouteController } from '@/server/api-adapters/hr/policies/policy-route-controllers';

interface RouteParams {
    params: {
        policyId: string;
    };
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await assignHrPolicyRouteController(request, params.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
