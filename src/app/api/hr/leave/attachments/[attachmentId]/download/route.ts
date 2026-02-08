import { NextResponse } from 'next/server';

import { presignLeaveAttachmentDownloadController } from '@/server/api-adapters/hr/leave/presign-leave-attachment-download';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: Promise<{ attachmentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await presignLeaveAttachmentDownloadController({ request, attachmentId: resolvedParams.attachmentId });
        return NextResponse.redirect(result.url);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
