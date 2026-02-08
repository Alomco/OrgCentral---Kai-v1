import { NextResponse } from 'next/server';
import { ValidationError } from '@/server/errors';
import { recordReturnToWorkController } from '@/server/api-adapters/hr/absences/record-return-to-work';
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

        const result = await recordReturnToWorkController({ request, absenceId: resolvedParams.absenceId });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
