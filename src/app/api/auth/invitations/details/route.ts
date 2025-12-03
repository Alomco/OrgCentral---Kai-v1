import { NextResponse } from 'next/server';
import { getInvitationDetailsController } from '@/server/api-adapters/auth/get-invitation-details';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as unknown;
        const result = await getInvitationDetailsController(payload);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
