import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import {
    enrollTrainingRouteController,
    listTrainingRecordsRouteController,
} from '@/server/api-adapters/hr/training/training-route-controllers';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await listTrainingRecordsRouteController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await enrollTrainingRouteController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
