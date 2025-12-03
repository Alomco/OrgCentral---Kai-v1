import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { updateUnplannedAbsenceController } from '@/server/api-adapters/hr/absences/update-unplanned-absence';
import { deleteUnplannedAbsenceController } from '@/server/api-adapters/hr/absences/delete-unplanned-absence';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: {
        absenceId: string;
    };
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.absenceId) {
            throw new ValidationError('Absence id is required.');
        }

        const result = await updateUnplannedAbsenceController({ request, absenceId: params.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.absenceId) {
            throw new ValidationError('Absence id is required.');
        }

        const result = await deleteUnplannedAbsenceController({ request, absenceId: params.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
