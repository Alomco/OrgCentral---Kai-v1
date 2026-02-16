import { type NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { listLeaveAttachmentsController } from '@/server/api-adapters/hr/leave/list-leave-attachments';
import { ValidationError } from '@/server/errors';

interface RouteParams {
    params: Promise<{ requestId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        const requestId = resolvedParams.requestId;
        if (!requestId) {
            throw new ValidationError('Request id is required.');
        }
        const result = await listLeaveAttachmentsController({ request, requestId });
        return buildNoStoreJsonResponse({ attachments: result.attachments }, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
