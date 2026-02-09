import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';

import { auth } from '@/server/lib/auth';
import { buildErrorResponse } from '@/server/api-adapters/http/error-response';
import { AuthorizationError } from '@/server/errors';

const CREDENTIAL_PROVIDER_ID = 'credential';

export async function GET(request: Request): Promise<Response> {
    noStore();
    try {
        const session = await auth.api.getSession({ headers: request.headers });
        if (!session?.session) {
            throw new AuthorizationError(
                'Unauthenticated request - session not found.',
                { reason: 'unauthenticated' },
            );
        }

        const accounts = await auth.api.listUserAccounts({
            headers: request.headers,
        });

        const providers = accounts.map((account) => account.providerId);
        const hasPassword = providers.includes(CREDENTIAL_PROVIDER_ID);

        return NextResponse.json({ hasPassword, providers }, { status: 200 });
    } catch (error) {
        return buildErrorResponse(error);
    }
}
