import { unstable_noStore as noStore } from 'next/cache';
import { type NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { listPolicyAcknowledgmentsRouteController } from '@/server/api-adapters/hr/policies/acknowledgment-route-controllers';

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

        const result = await listPolicyAcknowledgmentsRouteController(request, resolvedParams.policyId);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
