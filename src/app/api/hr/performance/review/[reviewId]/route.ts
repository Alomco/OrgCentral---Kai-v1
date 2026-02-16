import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    deletePerformanceReviewRouteController,
    getPerformanceReviewRouteController,
    updatePerformanceReviewRouteController,
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
        const result = await getPerformanceReviewRouteController(request, resolvedParams.reviewId ?? '');
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        return NextResponse.json(
            await updatePerformanceReviewRouteController(request, resolvedParams.reviewId ?? ''),
            { status: 200 },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        return NextResponse.json(
            await deletePerformanceReviewRouteController(request, resolvedParams.reviewId ?? ''),
            { status: 200 },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
}
