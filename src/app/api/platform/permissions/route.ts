import { type NextRequest, NextResponse } from 'next/server';
import { getAppPermissionsController, createAppPermissionController } from '@/server/api-adapters/platform/permissions-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';

export async function GET(request: NextRequest) {
    try {
        const result = await getAppPermissionsController(request);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const result = await createAppPermissionController(request);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
