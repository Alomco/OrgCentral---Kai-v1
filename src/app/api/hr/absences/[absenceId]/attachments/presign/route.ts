import { NextResponse } from 'next/server';

import { presignAbsenceAttachmentController } from '@/server/api-adapters/hr/absences/presign-absence-attachment';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: Promise<{ absenceId: string }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        const result = await presignAbsenceAttachmentController({ request, absenceId: resolvedParams.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
