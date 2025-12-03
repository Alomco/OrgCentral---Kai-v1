import { NextResponse } from 'next/server';
import { getLeaveRequestsController } from '@/server/api-adapters/hr/leave/get-leave-requests';
import { submitLeaveRequestController } from '@/server/api-adapters/hr/leave/submit-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await getLeaveRequestsController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await submitLeaveRequestController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
