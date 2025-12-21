import { getSessionService } from '@/server/services/auth/session-service';
import type { SessionService } from '@/server/services/auth/session-service';
import type { RevokeSessionInput, RevokeSessionResult } from '@/server/use-cases/auth/sessions/revoke-session';
import { performSessionRevocation } from '@/server/use-cases/auth/sessions/revoke-session-action';

const sessionService = getSessionService();

export async function revokeSessionController(
    input: RevokeSessionInput,
    service: SessionService = sessionService,
): Promise<RevokeSessionResult> {
    return performSessionRevocation(input, { service });
}
