import { NextResponse } from 'next/server';
import { updateComplianceItemController } from '@/server/api-adapters/hr/compliance/update-compliance-item';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function PATCH(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await updateComplianceItemController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
