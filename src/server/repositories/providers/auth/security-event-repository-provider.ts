import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { ISecurityEventRepository } from '@/server/repositories/contracts/auth/security/security-event-repository-contract';
import { PrismaSecurityEventRepository } from '@/server/repositories/prisma/auth/security/prisma-security-event-repository';

export interface SecurityEventRepositoryOptions {
  prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

export function createSecurityEventRepository(
  options?: SecurityEventRepositoryOptions,
): ISecurityEventRepository {
  const prisma = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: BasePrismaRepositoryOptions = {
    prisma,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return new PrismaSecurityEventRepository(repoOptions);
}
