import { NextResponse } from 'next/server';
import { getAbsencesController } from '@/server/api-adapters/hr/absences/get-absences';
import { reportUnplannedAbsenceController } from '@/server/api-adapters/hr/absences/report-unplanned-absence';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await getAbsencesController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const result = await reportUnplannedAbsenceController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
