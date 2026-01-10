import { NextResponse } from 'next/server';

import { presignLeaveAttachmentDownloadController } from '@/server/api-adapters/hr/leave/presign-leave-attachment-download';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: { attachmentId: string };
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const result = await presignLeaveAttachmentDownloadController({ request, attachmentId: params.attachmentId });
        return NextResponse.redirect(result.url);
    } catch (error) {
        return buildErrorResponse(error);
    }
}