import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import {
    PrismaLeaveBalanceRepository,
    PrismaLeavePolicyRepository,
    PrismaLeaveRequestRepository,
} from '@/server/repositories/prisma/hr/leave';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { ILeavePolicyRepository } from '@/server/repositories/contracts/hr/leave/leave-policy-repository-contract';
import type { ILeaveRequestRepository } from '@/server/repositories/contracts/hr/leave/leave-request-repository-contract';

export interface LeavePolicyRepositoryDependencies {
  leavePolicyRepository: ILeavePolicyRepository;
  leaveBalanceRepository: ILeaveBalanceRepository;
  leaveRequestRepository: ILeaveRequestRepository;
}

export type Overrides = Partial<LeavePolicyRepositoryDependencies>;

export interface LeavePolicyServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildLeavePolicyServiceDependencies(
  options?: LeavePolicyServiceDependencyOptions,
): LeavePolicyRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite: options?.prismaOptions?.onAfterWrite,
  };

  return {
    leavePolicyRepository:
      options?.overrides?.leavePolicyRepository ?? new PrismaLeavePolicyRepository(repoOptions),
    leaveBalanceRepository:
      options?.overrides?.leaveBalanceRepository ?? new PrismaLeaveBalanceRepository(repoOptions),
    leaveRequestRepository:
      options?.overrides?.leaveRequestRepository ?? new PrismaLeaveRequestRepository(repoOptions),
  };
}
