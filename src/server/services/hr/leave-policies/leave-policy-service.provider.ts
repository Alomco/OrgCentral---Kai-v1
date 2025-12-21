import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import {
    PrismaLeaveBalanceRepository,
    PrismaLeavePolicyRepository,
    PrismaLeaveRequestRepository,
} from '@/server/repositories/prisma/hr/leave';
import { LeavePolicyService } from './leave-policy-service';
import type { LeavePolicyServiceContract, LeavePolicyServiceDependencies } from './leave-policy-service.types';

export type { LeavePolicyServiceContract };

export interface LeavePolicyServiceProviderOptions {
    overrides?: Partial<LeavePolicyServiceDependencies>;
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

const sharedDefaultOptions: LeavePolicyServiceProviderOptions = {};

export function getLeavePolicyService(
    options: LeavePolicyServiceProviderOptions = sharedDefaultOptions,
): LeavePolicyService {
    const prismaOptions = options.prismaOptions;

    const repoOptions: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'> = {
        prisma: prismaOptions?.prisma,
        trace: prismaOptions?.trace,
        onAfterWrite: prismaOptions?.onAfterWrite,
    };

    const defaults: LeavePolicyServiceDependencies = {
        leavePolicyRepository: new PrismaLeavePolicyRepository(repoOptions),
        leaveBalanceRepository: new PrismaLeaveBalanceRepository(repoOptions),
        leaveRequestRepository: new PrismaLeaveRequestRepository(repoOptions),
    };

    if (!options.overrides || Object.keys(options.overrides).length === 0) {
        return new LeavePolicyService(defaults);
    }

    return new LeavePolicyService({
        ...defaults,
        ...options.overrides,
    });
}

export const defaultLeavePolicyServiceProvider: { service: LeavePolicyServiceContract } = {
    service: getLeavePolicyService(),
};
