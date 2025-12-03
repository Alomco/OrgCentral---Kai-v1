import { PrismaUserSessionRepository } from '@/server/repositories/prisma/auth/sessions';
import {
    getSessionContext,
    type GetSessionDependencies,
    type GetSessionInput,
    type GetSessionResult,
} from '@/server/use-cases/auth/sessions/get-session';

const userSessionRepository = new PrismaUserSessionRepository();

const defaultDependencies: GetSessionDependencies = {
    userSessionRepository,
};

export async function getSessionController(
    input: GetSessionInput,
    dependencies: GetSessionDependencies = defaultDependencies,
): Promise<GetSessionResult> {
    return getSessionContext(dependencies, input);
}
