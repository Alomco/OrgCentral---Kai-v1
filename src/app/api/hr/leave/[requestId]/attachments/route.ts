import { NextResponse } from 'next/server';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listLeaveAttachmentsController } from '@/server/api-adapters/hr/leave/list-leave-attachments';
import { ValidationError } from '@/server/errors';

interface RouteParams {
    params: Promise<{ requestId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const requestId = resolvedParams.requestId;
        if (!requestId) {
            throw new ValidationError('Request id is required.');
        }
        const result = await listLeaveAttachmentsController({ request, requestId });
        return NextResponse.json({ attachments: result.attachments }, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
