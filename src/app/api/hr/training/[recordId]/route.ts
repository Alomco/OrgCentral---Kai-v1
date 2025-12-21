import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    deleteTrainingRecordRouteController,
    getTrainingRecordRouteController,
    updateTrainingRecordRouteController,
} from '@/server/api-adapters/hr/training/training-route-controllers';

interface RouteParams {
    params: {
        recordId: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await getTrainingRecordRouteController(request, params.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await updateTrainingRecordRouteController(request, params.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await deleteTrainingRecordRouteController(request, params.recordId);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
