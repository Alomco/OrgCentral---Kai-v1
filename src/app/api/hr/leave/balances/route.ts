import { NextResponse } from 'next/server';
import { getLeaveBalanceController } from '@/server/api-adapters/hr/leave/get-leave-balance';
import { createLeaveBalanceController } from '@/server/api-adapters/hr/leave/create-leave-balance';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await getLeaveBalanceController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await createLeaveBalanceController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
