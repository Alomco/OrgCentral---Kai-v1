import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { LeaveBalanceServiceContract } from '@/server/services/hr/leave/leave-balance-service.provider';
import { getLeaveBalanceService } from '@/server/services/hr/leave/leave-balance-service.provider';
import type { LeaveAccrualPayload } from './accrual.types';

type LeaveAccrualProcessorResult = Awaited<ReturnType<LeaveBalanceServiceContract['syncAccruals']>>;

interface LeaveAccrualProcessorDependencies {
    leaveBalanceService?: LeaveBalanceServiceContract;
}

export class LeaveAccrualProcessor {
    private readonly leaveBalanceService: LeaveBalanceServiceContract;

    constructor(deps?: LeaveAccrualProcessorDependencies) {
        this.leaveBalanceService = deps?.leaveBalanceService ?? getLeaveBalanceService();
    }

    async process(
        payload: LeaveAccrualPayload,
        authorization: RepositoryAuthorizationContext,
    ): Promise<LeaveAccrualProcessorResult> {
        const referenceDate = payload.referenceDate as Date | string | number | undefined;
        return this.leaveBalanceService.syncAccruals({
            authorization,
            referenceDate,
            year: payload.year,
            employeeIds: payload.employeeIds,
            leaveTypes: payload.leaveTypes,
            dryRun: payload.dryRun,
        });
    }
}
