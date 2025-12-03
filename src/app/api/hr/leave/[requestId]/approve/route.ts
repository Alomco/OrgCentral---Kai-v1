import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { approveLeaveRequestController } from '@/server/api-adapters/hr/leave/approve-leave-request';
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
        const result = await approveLeaveRequestController({ request, requestId: params.requestId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
