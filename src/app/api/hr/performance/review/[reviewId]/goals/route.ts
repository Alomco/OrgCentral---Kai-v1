import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    addPerformanceGoalForReviewRouteController,
    listPerformanceGoalsForReviewRouteController,
} from '@/server/api-adapters/hr/performance/review-route-controllers';

interface RouteParams {
    params: Promise<{
        reviewId?: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        const result = await listPerformanceGoalsForReviewRouteController(request, resolvedParams.reviewId ?? '');
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const result = await addPerformanceGoalForReviewRouteController(request, resolvedParams.reviewId ?? '');
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
