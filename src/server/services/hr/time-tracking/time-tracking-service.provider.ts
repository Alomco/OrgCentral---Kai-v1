import { TimeTrackingService, type TimeTrackingServiceDependencies } from './time-tracking-service';
import { buildTimeTrackingServiceDependencies, type TimeTrackingServiceDependencyOptions } from '@/server/repositories/providers/hr/time-tracking-service-dependencies';

const sharedTimeTrackingService = (() => {
    const dependencies = buildTimeTrackingServiceDependencies();
    return new TimeTrackingService(dependencies);
})();

export function getTimeTrackingService(
    overrides?: Partial<TimeTrackingServiceDependencies>,
    options?: TimeTrackingServiceDependencyOptions,
): TimeTrackingService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedTimeTrackingService;
    }

    const dependencies = buildTimeTrackingServiceDependencies({
        prismaOptions: options?.prismaOptions,
        overrides,
    });

    return new TimeTrackingService(dependencies);
}

export type TimeTrackingServiceContract = Pick<
    TimeTrackingService,
    'listTimeEntries' | 'getTimeEntry' | 'createTimeEntry' | 'updateTimeEntry' | 'approveTimeEntry'
>;

export interface TimeTrackingServiceProvider {
    service: TimeTrackingServiceContract;
}

export const defaultTimeTrackingServiceProvider: TimeTrackingServiceProvider = {
    service: getTimeTrackingService(),
};
