import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    deleteTrainingRecordRouteController,
    getTrainingRecordRouteController,
    updateTrainingRecordRouteController,
} from '@/server/api-adapters/hr/training/training-route-controllers';

interface RouteParams {
    params: Promise<{
        recordId: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        const result = await getTrainingRecordRouteController(request, resolvedParams.recordId);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const result = await updateTrainingRecordRouteController(request, resolvedParams.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        const result = await deleteTrainingRecordRouteController(request, resolvedParams.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
