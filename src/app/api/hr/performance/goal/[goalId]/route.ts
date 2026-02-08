import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    deletePerformanceGoalRouteController,
    updatePerformanceGoalRouteController,
} from '@/server/api-adapters/hr/performance/goal-route-controllers';

interface RouteParams {
    params: Promise<{
        goalId?: string;
    }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await updatePerformanceGoalRouteController(request, resolvedParams.goalId ?? '');
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await deletePerformanceGoalRouteController(request, resolvedParams.goalId ?? '');
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
