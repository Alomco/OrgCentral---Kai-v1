import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { getLeaveRequestController } from '@/server/api-adapters/hr/leave/get-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: Promise<{
        requestId?: string;
    }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const resolvedParams = await params;
        if (!resolvedParams.requestId) {
            throw new ValidationError('Leave request id is required.');
        }
        const result = await getLeaveRequestController({ request, requestId: resolvedParams.requestId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
