import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import { defaultPerformanceServiceProvider, type PerformanceServiceContract } from '@/server/services/hr/performance/performance-service.provider';

export const PERFORMANCE_RESOURCE_REVIEW = 'hr.performance.review';
export const PERFORMANCE_RESOURCE_GOAL = 'hr.performance.goal';

export interface ResolvedPerformanceControllerDependencies {
    session: GetSessionDependencies;
    service: PerformanceServiceContract;
}

export type PerformanceControllerDependencies = Partial<ResolvedPerformanceControllerDependencies>;

export const defaultPerformanceControllerDependencies: ResolvedPerformanceControllerDependencies = {
    session: {},
    service: defaultPerformanceServiceProvider.service,
};

export function resolvePerformanceControllerDependencies(
    overrides?: PerformanceControllerDependencies,
): ResolvedPerformanceControllerDependencies {
    if (!overrides) {
        return defaultPerformanceControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultPerformanceControllerDependencies.session,
        service: overrides.service ?? defaultPerformanceControllerDependencies.service,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function readOptionalStringField(input: unknown, key: string): string | undefined {
    if (!isRecord(input)) {
        return undefined;
    }

    const value = input[key];
    return typeof value === 'string' ? value : undefined;
}
