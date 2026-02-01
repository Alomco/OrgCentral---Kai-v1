import { NextResponse } from 'next/server';

import { exportHrReportController } from '@/server/api-adapters/hr/reports/export';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const result = await exportHrReportController(request);
        return new NextResponse(result.body, {
            status: 200,
            headers: {
                'Content-Type': result.contentType,
                'Content-Disposition': `attachment; filename="${result.fileName}"`,
            },
        });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
