import type { NextRequest } from 'next/server';
import type { BetterAuthService } from '@/server/services/auth/better-auth-service';

export interface HandleBetterAuthRequestInput {
    request: NextRequest;
}

export async function handleBetterAuthRequest(
    input: HandleBetterAuthRequestInput,
    deps: { service: BetterAuthService },
): Promise<Response> {
    return deps.service.handle(input.request);
}
