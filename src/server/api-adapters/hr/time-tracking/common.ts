import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import {
    defaultTimeTrackingServiceProvider,
    type TimeTrackingServiceContract,
} from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import { HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export const TIME_ENTRY_RESOURCE = HR_RESOURCE.TIME_ENTRY;

export interface ResolvedTimeTrackingControllerDependencies {
    session: GetSessionDependencies;
    service: TimeTrackingServiceContract;
}

export type TimeTrackingControllerDependencies = Partial<ResolvedTimeTrackingControllerDependencies>;

export const defaultTimeTrackingControllerDependencies: ResolvedTimeTrackingControllerDependencies = {
    session: {},
    service: defaultTimeTrackingServiceProvider.service,
};

export function resolveTimeTrackingControllerDependencies(
    overrides?: TimeTrackingControllerDependencies,
): ResolvedTimeTrackingControllerDependencies {
    if (!overrides) {
        return defaultTimeTrackingControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultTimeTrackingControllerDependencies.session,
        service: overrides.service ?? defaultTimeTrackingControllerDependencies.service,
    };
}
