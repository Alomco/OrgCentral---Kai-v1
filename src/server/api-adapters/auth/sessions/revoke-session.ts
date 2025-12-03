import { PrismaUserSessionRepository } from '@/server/repositories/prisma/auth/sessions';
import {
    revokeSession,
    type RevokeSessionDependencies,
    type RevokeSessionInput,
    type RevokeSessionResult,
} from '@/server/use-cases/auth/sessions/revoke-session';

const userSessionRepository = new PrismaUserSessionRepository();

const defaultDependencies: RevokeSessionDependencies = {
    userSessionRepository,
};

export async function revokeSessionController(
    input: RevokeSessionInput,
    dependencies: RevokeSessionDependencies = defaultDependencies,
): Promise<RevokeSessionResult> {
    return revokeSession(dependencies, input);
}
