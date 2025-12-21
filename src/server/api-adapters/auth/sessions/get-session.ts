import { getSessionService } from '@/server/services/auth/session-service';
import type { SessionService } from '@/server/services/auth/session-service';
import type { GetSessionInput, GetSessionResult } from '@/server/use-cases/auth/sessions/get-session';
import { fetchSessionContext } from '@/server/use-cases/auth/sessions/get-session-action';

const sessionService = getSessionService();

export async function getSessionController(
    input: GetSessionInput,
    service: SessionService = sessionService,
): Promise<GetSessionResult> {
    return fetchSessionContext(input, { service });
}
