import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    getTimeEntryRouteController,
    updateTimeEntryRouteController,
} from '@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers';

interface RouteParams {
    params: {
        entryId: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await getTimeEntryRouteController(request, params.entryId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await updateTimeEntryRouteController(request, params.entryId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
