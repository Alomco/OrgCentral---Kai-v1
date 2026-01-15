import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IWaitlistRepository } from '@/server/repositories/contracts/auth/waitlist/waitlist-repository-contract';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaWaitlistRepository } from '@/server/repositories/prisma/auth/waitlist';

export interface WaitlistRepositoryOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export function createWaitlistRepository(
    options?: WaitlistRepositoryOptions,
): IWaitlistRepository {
    const prisma = options?.prismaOptions?.prisma ?? defaultPrismaClient;

    return new PrismaWaitlistRepository({
        prisma,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    });
}
