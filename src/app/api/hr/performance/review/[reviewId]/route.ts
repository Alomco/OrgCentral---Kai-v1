import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
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
    try {
            const resolvedParams = await params;
        return NextResponse.json(
            await getPerformanceReviewRouteController(request, resolvedParams.reviewId ?? ''),
            { status: 200 },
        );
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
