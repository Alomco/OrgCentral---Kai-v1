import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    getTimeEntryRouteController,
    updateTimeEntryRouteController,
} from '@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

interface RouteParams {
    params: Promise<{
        entryId: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        const result = await getTimeEntryRouteController(request, resolvedParams.entryId);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const resolvedParams = await params;
        const result = await updateTimeEntryRouteController(request, resolvedParams.entryId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
