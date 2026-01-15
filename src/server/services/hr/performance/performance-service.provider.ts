import { PerformanceService, type PerformanceServiceDependencies } from './performance-service';
import { buildPerformanceServiceDependencies, type PerformanceServiceDependencyOptions } from '@/server/repositories/providers/hr/performance-service-dependencies';

export interface PerformanceServiceProviderOptions {
    overrides?: Partial<PerformanceServiceDependencies>;
    prismaOptions?: PerformanceServiceDependencyOptions;
}

const sharedDefaultOptions: PerformanceServiceProviderOptions = {};

export function getPerformanceService(options: PerformanceServiceProviderOptions = sharedDefaultOptions): PerformanceService {
    const dependencies = buildPerformanceServiceDependencies(options.prismaOptions);

    if (!options.overrides || Object.keys(options.overrides).length === 0) {
        return new PerformanceService(dependencies);
    }

    return new PerformanceService({
        ...dependencies,
        ...options.overrides,
    });
}

export type PerformanceServiceContract = Pick<
    PerformanceService,
    | 'getReviewById'
    | 'getReviewsByEmployee'
    | 'getGoalsByReviewId'
    | 'createReview'
    | 'updateReview'
    | 'deleteReview'
    | 'addGoal'
    | 'updateGoal'
    | 'deleteGoal'
>;

export const defaultPerformanceServiceProvider: { service: PerformanceServiceContract } = {
    service: getPerformanceService(),
};
