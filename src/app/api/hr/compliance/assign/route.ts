import { NextResponse } from 'next/server';
import { assignComplianceItemsController } from '@/server/api-adapters/hr/compliance/assign-compliance-items';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await assignComplianceItemsController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
