import { NextResponse } from 'next/server';
import { addToWaitlistController } from '@/server/api-adapters/auth/add-to-waitlist';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as unknown;
        const result = await addToWaitlistController(payload);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
