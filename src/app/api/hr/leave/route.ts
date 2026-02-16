import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { getLeaveRequestsController } from '@/server/api-adapters/hr/leave/get-leave-requests';
import { submitLeaveRequestController } from '@/server/api-adapters/hr/leave/submit-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await getLeaveRequestsController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await submitLeaveRequestController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
