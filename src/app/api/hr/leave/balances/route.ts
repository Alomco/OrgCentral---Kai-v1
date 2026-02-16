import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getLeaveBalanceController } from '@/server/api-adapters/hr/leave/get-leave-balance';
import { createLeaveBalanceController } from '@/server/api-adapters/hr/leave/create-leave-balance';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await getLeaveBalanceController(request);
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
        const result = await createLeaveBalanceController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
