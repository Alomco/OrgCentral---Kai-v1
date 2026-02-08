import { NextResponse, type NextRequest } from 'next/server';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { devColdStartController } from '@/server/api-adapters/platform/bootstrap/dev-cold-start-controller';

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const result = await devColdStartController(request);

        return NextResponse.json(result, {
            status: 200,
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
