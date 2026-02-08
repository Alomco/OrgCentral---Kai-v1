import { NextResponse } from 'next/server';

import { ValidationError } from '@/server/errors';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    deleteLeavePolicyRouteController,
    updateLeavePolicyRouteController,
} from '@/server/api-adapters/hr/leave-policies/leave-policy-route-controllers';

interface RouteParams {
    params: Promise<{
        policyId: string;
    }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await updateLeavePolicyRouteController(request, resolvedParams.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.policyId) {
            throw new ValidationError('Policy id is required.');
        }

        const result = await deleteLeavePolicyRouteController(request, resolvedParams.policyId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
