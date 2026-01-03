import { type NextRequest, NextResponse } from 'next/server';
import { getEmployeeChecklistsController } from '@/server/api-adapters/hr/onboarding/instances-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const result = await getEmployeeChecklistsController(request);
        return NextResponse.json(result);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
