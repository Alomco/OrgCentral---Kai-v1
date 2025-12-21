import { PrismaTimeEntryRepository } from '@/server/repositories/prisma/hr/time-tracking';
import { TimeTrackingService, type TimeTrackingServiceDependencies } from './time-tracking-service';

const timeEntryRepository = new PrismaTimeEntryRepository();

const defaultTimeTrackingServiceDependencies: TimeTrackingServiceDependencies = {
    timeEntryRepository,
};

const sharedTimeTrackingService = new TimeTrackingService(defaultTimeTrackingServiceDependencies);

export function getTimeTrackingService(
    overrides?: Partial<TimeTrackingServiceDependencies>,
): TimeTrackingService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedTimeTrackingService;
    }

    return new TimeTrackingService({
        ...defaultTimeTrackingServiceDependencies,
        ...overrides,
    });
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

