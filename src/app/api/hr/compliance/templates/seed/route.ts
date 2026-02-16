import { NextResponse } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { seedComplianceTemplatesController } from '@/server/api-adapters/hr/compliance/seed-default-templates';
import { enforceCsrfOriginGuard } from '@/server/security/guards/csrf-origin-guard';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const guardResponse = await enforceCsrfOriginGuard(request);
        if (guardResponse) {
            return guardResponse;
        }
        const result = await seedComplianceTemplatesController(request);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
