import { NextResponse } from 'next/server';
import { triggerLeaveAccrualCron } from '@/server/api-adapters/cron/leave-accrual';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await triggerLeaveAccrualCron(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
