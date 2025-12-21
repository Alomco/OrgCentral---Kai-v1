import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getInvitationDetailsController } from '@/server/api-adapters/auth/get-invitation-details';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';

const paramsSchema = z.object({
    token: z.string().min(1, 'Invitation token is required'),
});

interface RouteParams {
    params: {
        token?: string;
    };
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
    try {
        const { token } = paramsSchema.parse(params);
        const result = await getInvitationDetailsController({ token });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
