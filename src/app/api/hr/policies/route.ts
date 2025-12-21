import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    createHrPolicyRouteController,
    listHrPoliciesRouteController,
} from '@/server/api-adapters/hr/policies/policy-route-controllers';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await listHrPoliciesRouteController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await createHrPolicyRouteController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
