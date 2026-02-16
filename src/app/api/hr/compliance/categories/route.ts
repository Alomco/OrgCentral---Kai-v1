import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';
import { listComplianceCategoriesController } from '@/server/api-adapters/hr/compliance/list-compliance-categories';
import { upsertComplianceCategoryController } from '@/server/api-adapters/hr/compliance/upsert-compliance-category';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await listComplianceCategoriesController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await upsertComplianceCategoryController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
