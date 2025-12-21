import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import {
    getHrSettingsRouteController,
    updateHrSettingsRouteController,
} from '@/server/api-adapters/hr/settings/settings-route-controllers';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await getHrSettingsRouteController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const result = await updateHrSettingsRouteController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
