import type { RevokeSessionInput, RevokeSessionResult } from '@/server/use-cases/auth/sessions/revoke-session';
import { getSessionService, type SessionService } from '@/server/services/auth/session-service';

export interface RevokeSessionOptions {
    service?: SessionService;
}

export async function performSessionRevocation(
    input: RevokeSessionInput,
    options?: RevokeSessionOptions,
): Promise<RevokeSessionResult> {
    const service = options?.service ?? getSessionService();
    return service.revokeSession(input);
}
