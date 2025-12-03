// API adapter: Use-case: log a security event using the security-event repository for audit/compliance.
import { z } from 'zod';
import { PrismaSecurityEventRepository } from '@/server/repositories/prisma/auth/security/prisma-security-event-repository';
import { logSecurityEvent } from '@/server/use-cases/auth/security/log-security-event';
import type { LogSecurityEventInput, LogSecurityEventRequest } from '@/server/types';
import { LogSecurityEventRequestSchema } from '@/server/types';

/**
 * Controller-level adapter for logging a security event.
 * - Validates runtime input using Zod
 * - Instantiates the Prisma repository (caller can provide an alternative implementation)
 * - Calls the use-case with the validated input
 *
 * Returns the use-case output or throws an error that controllers can map to HTTP status codes.
 */
const ActorSchema = z.object({
    userId: z.string().min(1, 'Authenticated user id is required to log a security event.'),
});

export async function logSecurityEventController(
    payload: unknown,
    actor: unknown,
    repository?: PrismaSecurityEventRepository,
): Promise<{ success: true }> {
    // Validate at the boundary
    const input = LogSecurityEventRequestSchema.parse(payload) as LogSecurityEventRequest;
    const { userId } = ActorSchema.parse(actor);

    const repo = repository ?? new PrismaSecurityEventRepository();
    const logInput: LogSecurityEventInput = { ...input, userId };

    // The use-case performs its own authorization guard (withRepositoryAuthorization)
    return logSecurityEvent(logInput, repo);
}
