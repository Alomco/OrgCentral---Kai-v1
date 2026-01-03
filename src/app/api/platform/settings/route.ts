import { type NextRequest, NextResponse } from 'next/server';
import { getEnterpriseSettingsController, updateEnterpriseSettingsController } from '@/server/api-adapters/platform/settings-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const result = await getEnterpriseSettingsController(request);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const result = await updateEnterpriseSettingsController(request);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
