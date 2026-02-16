import { NextResponse } from 'next/server';

import { presignLeaveAttachmentController } from '@/server/api-adapters/hr/leave/presign-leave-attachment';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await presignLeaveAttachmentController({ request });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}