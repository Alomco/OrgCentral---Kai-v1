import { type NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { z } from 'zod';

import { getInvitationDetailsController } from '@/server/api-adapters/auth/get-invitation-details';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { buildNoStoreJsonResponse } from '@/server/api-adapters/http/no-store-response';

const paramsSchema = z.object({
    token: z.string().min(1, 'Invitation token is required'),
});

interface RouteParams {
    params: Promise<{
        token?: string;
    }>;
}

export async function GET(_request: Request, { params }: RouteParams): Promise<NextResponse> {
    noStore();
    try {
        const resolvedParams = await params;
        const { token } = paramsSchema.parse(resolvedParams);
        const result = await getInvitationDetailsController({ token });
        return buildNoStoreJsonResponse(result, 200);
    } catch (error) {
        return buildErrorResponse(error);
    }
}
