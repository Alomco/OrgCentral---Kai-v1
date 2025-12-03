import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { rejectLeaveRequestController } from '@/server/api-adapters/hr/leave/reject-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: {
        requestId?: string;
    };
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.requestId) {
            throw new ValidationError('Leave request id is required.');
        }
        const result = await rejectLeaveRequestController({ request, requestId: params.requestId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
