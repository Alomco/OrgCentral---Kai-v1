import { type NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { ValidationError } from '@/server/errors';
import { getLeaveRequestController } from '@/server/api-adapters/hr/leave/get-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

interface RouteParams {
    params: Promise<{
        requestId?: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        if (!resolvedParams.requestId) {
            throw new ValidationError('Leave request id is required.');
        }
        const result = await getLeaveRequestController({ request, requestId: resolvedParams.requestId });
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
