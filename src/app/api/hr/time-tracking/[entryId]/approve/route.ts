import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { approveTimeEntryRouteController } from '@/server/api-adapters/hr/time-tracking/time-tracking-route-controllers';

interface RouteParams {
    params: {
        entryId: string;
    };
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await approveTimeEntryRouteController(request, params.entryId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
