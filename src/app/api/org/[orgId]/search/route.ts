import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { listOrgTopbarSearchController } from '@/server/api-adapters/org/search/org-search-controller';

interface RouteParams {
    params: Promise<{ orgId: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { orgId } = await params;
        const result = await listOrgTopbarSearchController(request, orgId);
        return NextResponse.json(result);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
