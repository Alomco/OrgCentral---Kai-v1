import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaUserRepository } from '@/server/repositories/prisma/org/users/prisma-user-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IUserRepository } from '@/server/repositories/contracts/org/users/user-repository-contract';

export interface UserRepositoryDependencies {
  userRepository: IUserRepository;
}

export type Overrides = Partial<UserRepositoryDependencies>;

export interface UserServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildUserServiceDependencies(
  options?: UserServiceDependencyOptions,
): UserRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    userRepository: options?.overrides?.userRepository ?? new PrismaUserRepository(repoOptions),
  };
}
