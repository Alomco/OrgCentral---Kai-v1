import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { getLeaveRequestController } from '@/server/api-adapters/hr/leave/get-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: {
        requestId?: string;
    };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.requestId) {
            throw new ValidationError('Leave request id is required.');
        }
        const result = await getLeaveRequestController({ request, requestId: params.requestId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
