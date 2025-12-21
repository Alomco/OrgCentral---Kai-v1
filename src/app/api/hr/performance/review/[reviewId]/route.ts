import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    deletePerformanceReviewRouteController,
    getPerformanceReviewRouteController,
    updatePerformanceReviewRouteController,
} from '@/server/api-adapters/hr/performance/review-route-controllers';

interface RouteParams {
    params: {
        reviewId?: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        return NextResponse.json(
            await getPerformanceReviewRouteController(request, params.reviewId ?? ''),
            { status: 200 },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        return NextResponse.json(
            await updatePerformanceReviewRouteController(request, params.reviewId ?? ''),
            { status: 200 },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        return NextResponse.json(
            await deletePerformanceReviewRouteController(request, params.reviewId ?? ''),
            { status: 200 },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
}
