import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { addAbsenceAttachmentsController } from '@/server/api-adapters/hr/absences/add-absence-attachments';
import { removeAbsenceAttachmentController } from '@/server/api-adapters/hr/absences/remove-absence-attachment';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: Promise<{
        absenceId: string;
    }>;
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.absenceId) {
            throw new ValidationError('Absence id is required.');
        }

        const result = await addAbsenceAttachmentsController({ request, absenceId: resolvedParams.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
            const resolvedParams = await params;
        if (!resolvedParams.absenceId) {
            throw new ValidationError('Absence id is required.');
        }

        const result = await removeAbsenceAttachmentController({ request, absenceId: resolvedParams.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
