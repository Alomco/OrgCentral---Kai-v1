import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import {
    syncLeaveAccruals,
    type SyncLeaveAccrualsDependencies,
    type SyncLeaveAccrualsInput,
    type SyncLeaveAccrualsResult,
} from '@/server/use-cases/hr/leave/acc/sync-leave-accruals';

export type LeaveBalanceServiceDependencies = SyncLeaveAccrualsDependencies;

export class LeaveBalanceService extends AbstractHrService {
    constructor(private readonly dependencies: LeaveBalanceServiceDependencies) {
        super();
    }

    async syncAccruals(input: SyncLeaveAccrualsInput): Promise<SyncLeaveAccrualsResult> {
        const { authorization, employeeIds, leaveTypes, dryRun } = input;
        await this.ensureOrgAccess(authorization);

        const metadata = {
            targetedEmployees: employeeIds?.length,
            targetedLeaveTypes: leaveTypes?.length,
            dryRun: Boolean(dryRun),
        } satisfies Record<string, unknown>;

        const context = this.buildContext(authorization, { metadata });
        const normalizedInput: SyncLeaveAccrualsInput = {
            ...input,
            authorization,
        };

        return this.executeInServiceContext(context, 'hr.leave.accrual.sync', () =>
            syncLeaveAccruals(this.dependencies, normalizedInput),
        );
    }
}
