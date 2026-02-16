import { NextResponse } from 'next/server';
import { ensureEmployeeBalancesController } from '@/server/api-adapters/hr/leave/ensure-employee-balances';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await ensureEmployeeBalancesController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
