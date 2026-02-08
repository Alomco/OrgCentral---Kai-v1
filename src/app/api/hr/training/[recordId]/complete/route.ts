import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { completeTrainingRouteController } from '@/server/api-adapters/hr/training/training-route-controllers';

interface RouteParams {
    params: Promise<{
        recordId: string;
    }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await completeTrainingRouteController(request, resolvedParams.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
