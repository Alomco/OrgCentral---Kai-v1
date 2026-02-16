import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    getHrPolicyRouteController,
    updateHrPolicyRouteController,
} from '@/server/api-adapters/hr/policies/policy-route-controllers';

interface RouteParams {
    params: Promise<{
        policyId: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await getHrPolicyRouteController(request, resolvedParams.policyId);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await updateHrPolicyRouteController(request, resolvedParams.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
