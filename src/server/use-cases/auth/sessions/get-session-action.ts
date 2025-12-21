import type { GetSessionInput, GetSessionResult } from '@/server/use-cases/auth/sessions/get-session';
import { getSessionService, type SessionService } from '@/server/services/auth/session-service';

export interface FetchSessionContextOptions {
    service?: SessionService;
}

export async function fetchSessionContext(
    input: GetSessionInput,
    options?: FetchSessionContextOptions,
): Promise<GetSessionResult> {
    const service = options?.service ?? getSessionService();
    return service.getSession(input);
}
