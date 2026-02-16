import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { getAbsencesController } from '@/server/api-adapters/hr/absences/get-absences';
import { reportUnplannedAbsenceController } from '@/server/api-adapters/hr/absences/report-unplanned-absence';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await getAbsencesController(request);
        return buildNoStoreJsonResponse(result, 200);
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
