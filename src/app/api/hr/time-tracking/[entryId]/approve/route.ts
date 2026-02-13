import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { approveTimeEntryRouteController } from '@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

interface RouteParams {
    params: Promise<{
        entryId: string;
    }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const resolvedParams = await params;
        const result = await approveTimeEntryRouteController(request, resolvedParams.entryId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
