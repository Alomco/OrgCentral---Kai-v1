import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { approveUnplannedAbsenceController } from '@/server/api-adapters/hr/absences/approve-unplanned-absence';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

interface RouteParams {
    params: {
        absenceId: string;
    };
}

export async function POST(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        if (!params.absenceId) {
            throw new ValidationError('Absence id is required.');
        }
        const result = await approveUnplannedAbsenceController({ request, absenceId: params.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
