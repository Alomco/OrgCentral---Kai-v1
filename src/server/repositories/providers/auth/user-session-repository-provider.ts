import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IUserSessionRepository } from '@/server/repositories/contracts/auth/sessions/user-session-repository-contract';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaUserSessionRepository } from '@/server/repositories/prisma/auth/sessions';

export interface UserSessionRepositoryOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export function createUserSessionRepository(
    options?: UserSessionRepositoryOptions,
): IUserSessionRepository {
    const prisma = options?.prismaOptions?.prisma ?? defaultPrismaClient;

    return new PrismaUserSessionRepository({
        prisma,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    });
}
