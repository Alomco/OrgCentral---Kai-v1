import { NextResponse } from 'next/server';
import { submitLeaveRequestController } from '@/server/api-adapters/hr/leave/submit-leave-request';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await submitLeaveRequestController(request);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
