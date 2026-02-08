import { NextResponse } from 'next/server';

import { presignAbsenceAttachmentDownloadController } from '@/server/api-adapters/hr/absences/presign-absence-attachment-download';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: Promise<{ absenceId: string; attachmentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await presignAbsenceAttachmentDownloadController({
            request,
            absenceId: resolvedParams.absenceId,
            attachmentId: resolvedParams.attachmentId,
        });
        return NextResponse.redirect(result.url);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
