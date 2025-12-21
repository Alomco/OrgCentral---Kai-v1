import type { NextRequest } from 'next/server';
import { getBetterAuthService } from '@/server/services/auth/better-auth-service';
import type { BetterAuthService } from '@/server/services/auth/better-auth-service';
import { handleBetterAuthRequest } from '@/server/use-cases/auth/better-auth/handle-better-auth-request';

const betterAuthService = getBetterAuthService();

export async function betterAuthController(
    request: NextRequest,
    service: BetterAuthService = betterAuthService,
): Promise<Response> {
    return handleBetterAuthRequest({ request }, { service });
}
