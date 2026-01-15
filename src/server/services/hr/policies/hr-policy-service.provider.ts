import { HrPolicyService } from './hr-policy-service';
import type { HrPolicyServiceContract, HrPolicyServiceDependencies } from './hr-policy-service.types';
import { buildHrPolicyServiceDependencies, type HrPolicyServiceDependencyOptions } from '@/server/repositories/providers/hr/hr-policy-service-dependencies';

export type { HrPolicyServiceContract };

export interface HrPolicyServiceProviderOptions {
    overrides?: Partial<HrPolicyServiceDependencies>;
    prismaOptions?: HrPolicyServiceDependencyOptions;
}

const sharedDefaultOptions: HrPolicyServiceProviderOptions = {};

export function getHrPolicyService(
    options: HrPolicyServiceProviderOptions = sharedDefaultOptions,
): HrPolicyService {
    const dependencies = buildHrPolicyServiceDependencies(options.prismaOptions);

    if (!options.overrides || Object.keys(options.overrides).length === 0) {
        return new HrPolicyService(dependencies);
    }

    return new HrPolicyService({
        ...dependencies,
        ...options.overrides,
    });
}

export const defaultHrPolicyServiceProvider: { service: HrPolicyServiceContract } = {
    service: getHrPolicyService(),
};
