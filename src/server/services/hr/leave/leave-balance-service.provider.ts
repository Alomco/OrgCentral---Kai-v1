import { buildLeaveServiceDependencies } from '@/server/repositories/providers/hr/leave-service-dependencies';
import type { SyncLeaveAccrualsDependencies } from '@/server/use-cases/hr/leave/acc/sync-leave-accruals';
import { LeaveBalanceService } from './leave-balance-service';

const defaultDependencies: SyncLeaveAccrualsDependencies = buildLeaveServiceDependencies();

const sharedService = new LeaveBalanceService(defaultDependencies);

type LeaveBalanceServiceOverrides = Partial<SyncLeaveAccrualsDependencies>;

function hasOverrides(overrides?: LeaveBalanceServiceOverrides): overrides is LeaveBalanceServiceOverrides {
    if (!overrides) {
        return false;
    }

    return (
        typeof overrides.leaveBalanceRepository !== 'undefined' ||
        typeof overrides.leavePolicyRepository !== 'undefined' ||
        typeof overrides.profileRepository !== 'undefined' ||
        typeof overrides.organizationRepository !== 'undefined'
    );
}

function sanitizeOverrides(overrides: LeaveBalanceServiceOverrides): LeaveBalanceServiceOverrides {
    const sanitized: LeaveBalanceServiceOverrides = {};

    if (typeof overrides.leaveBalanceRepository !== 'undefined') {
        sanitized.leaveBalanceRepository = overrides.leaveBalanceRepository;
    }
    if (typeof overrides.leavePolicyRepository !== 'undefined') {
        sanitized.leavePolicyRepository = overrides.leavePolicyRepository;
    }
    if (typeof overrides.profileRepository !== 'undefined') {
        sanitized.profileRepository = overrides.profileRepository;
    }
    if (typeof overrides.organizationRepository !== 'undefined') {
        sanitized.organizationRepository = overrides.organizationRepository;
    }

    return sanitized;
}

export function getLeaveBalanceService(
    overrides?: LeaveBalanceServiceOverrides,
): LeaveBalanceService {
    if (!hasOverrides(overrides)) {
        return sharedService;
    }

    const sanitizedOverrides = sanitizeOverrides(overrides);

    return new LeaveBalanceService({
        ...defaultDependencies,
        ...sanitizedOverrides,
    });
}

export type LeaveBalanceServiceContract = Pick<LeaveBalanceService, 'syncAccruals'>;

export interface LeaveBalanceServiceProvider {
    service: LeaveBalanceServiceContract;
}

export const defaultLeaveBalanceServiceProvider: LeaveBalanceServiceProvider = {
    service: getLeaveBalanceService(),
};
