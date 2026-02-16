import { unstable_noStore as noStore } from 'next/cache';
import { type NextResponse } from 'next/server';
import { listComplianceItemsGroupedController } from '@/server/api-adapters/hr/compliance/list-compliance-items-grouped';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

export async function GET(request: Request): Promise<NextResponse> {
    noStore();
    try {
        const result = await listComplianceItemsGroupedController(request);
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
