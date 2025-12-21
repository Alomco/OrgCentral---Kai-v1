import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    createPerformanceReviewRouteController,
    listPerformanceReviewsRouteController,
} from '@/server/api-adapters/hr/performance/review-route-controllers';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await listPerformanceReviewsRouteController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await createPerformanceReviewRouteController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
