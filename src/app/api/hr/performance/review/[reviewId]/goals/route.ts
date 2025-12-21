import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    addPerformanceGoalForReviewRouteController,
    listPerformanceGoalsForReviewRouteController,
} from '@/server/api-adapters/hr/performance/review-route-controllers';

interface RouteParams {
    params: {
        reviewId?: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await listPerformanceGoalsForReviewRouteController(request, params.reviewId ?? '');
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await addPerformanceGoalForReviewRouteController(request, params.reviewId ?? '');
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
