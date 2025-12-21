import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { completeTrainingRouteController } from '@/server/api-adapters/hr/training/training-route-controllers';

interface RouteParams {
    params: {
        recordId: string;
    };
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await completeTrainingRouteController(request, params.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
