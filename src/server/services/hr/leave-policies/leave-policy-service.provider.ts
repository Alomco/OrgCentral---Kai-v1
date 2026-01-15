import { LeavePolicyService } from './leave-policy-service';
import type { LeavePolicyServiceContract, LeavePolicyServiceDependencies } from './leave-policy-service.types';
import { buildLeavePolicyServiceDependencies, type LeavePolicyServiceDependencyOptions } from '@/server/repositories/providers/hr/leave-policy-service-dependencies';

export type { LeavePolicyServiceContract };

export interface LeavePolicyServiceProviderOptions {
    overrides?: Partial<LeavePolicyServiceDependencies>;
    prismaOptions?: LeavePolicyServiceDependencyOptions['prismaOptions'];
}

const sharedDefaultOptions: LeavePolicyServiceProviderOptions = {};

export function getLeavePolicyService(
    options: LeavePolicyServiceProviderOptions = sharedDefaultOptions,
): LeavePolicyService {
    const dependencies = buildLeavePolicyServiceDependencies({
        prismaOptions: options.prismaOptions,
        overrides: options.overrides,
    });

    if (!options.overrides || Object.keys(options.overrides).length === 0) {
        return new LeavePolicyService(dependencies);
    }

    return new LeavePolicyService({
        ...dependencies,
        ...options.overrides,
    });
}

export const defaultLeavePolicyServiceProvider: { service: LeavePolicyServiceContract } = {
    service: getLeavePolicyService(),
};
