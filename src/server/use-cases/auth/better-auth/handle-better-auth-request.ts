import type { NextRequest } from 'next/server';
import type { BetterAuthService } from '@/server/services/auth/better-auth-service';
import { assertInviteOnlyEndpointAccess } from '@/server/use-cases/auth/better-auth/invite-only-policy';

export interface HandleBetterAuthRequestInput {
    request: NextRequest;
}

export async function handleBetterAuthRequest(
    input: HandleBetterAuthRequestInput,
    deps: { service: BetterAuthService },
): Promise<Response> {
    assertInviteOnlyEndpointAccess(input.request);
    return deps.service.handle(input.request);
}
