import { unstable_noStore as noStore } from 'next/cache';
import { type NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listPendingReviewComplianceItemsController } from '@/server/api-adapters/hr/compliance/list-pending-review-items';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await listPendingReviewComplianceItemsController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
