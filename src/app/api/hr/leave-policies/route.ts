import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    createLeavePolicyRouteController,
    listLeavePoliciesRouteController,
} from '@/server/api-adapters/hr/leave-policies/leave-policy-route-controllers';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await listLeavePoliciesRouteController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await createLeavePolicyRouteController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
