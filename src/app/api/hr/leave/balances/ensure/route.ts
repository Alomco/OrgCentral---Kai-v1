import { NextResponse } from 'next/server';
import { ensureEmployeeBalancesController } from '@/server/api-adapters/hr/leave/ensure-employee-balances';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await ensureEmployeeBalancesController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
