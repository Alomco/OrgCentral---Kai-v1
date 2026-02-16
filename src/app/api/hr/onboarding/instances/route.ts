import { type NextRequest } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getEmployeeChecklistsController } from '@/server/api-adapters/hr/onboarding/instances-controller';
import { DefaultErrorMapper } from '@/server/api-adapters/error-mappers/default-error-mapper';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

export async function GET(request: NextRequest) {
    noStore();
    try {
        const result = await getEmployeeChecklistsController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return DefaultErrorMapper.mapErrorToResponse(error);
    }
}
