import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import type { OrchestrationAuthorization } from './people-orchestration.types';
import {
    assignCompliancePackInputSchema,
    getEmployeeSummaryInputSchema,
    onboardEmployeeInputSchema,
    terminateEmployeeInputSchema,
    updateEligibilityInputSchema,
    type AssignCompliancePackInput,
    type GetEmployeeSummaryInput,
    type GetEmployeeSummaryResult,
    type OnboardEmployeeInput,
    type OnboardEmployeeResult,
    type TerminateEmployeeInput,
    type UpdateEligibilityInput,
} from './people-orchestration.types';
import type {
    PeopleOrchestrationDependencies,
    PeopleOrchestrationRuntime,
} from './people-orchestration.deps';
import {
    assignCompliancePackOperation,
    getEmployeeSummaryOperation,
    onboardEmployeeOperation,
    terminateEmployeeOperation,
    updateEligibilityOperation,
} from './operations';

export class PeopleOrchestrationService extends AbstractHrService {
    constructor(private readonly deps: PeopleOrchestrationDependencies) {
        super();
    }

    async onboardEmployee(input: OnboardEmployeeInput): Promise<OnboardEmployeeResult> {
        const parsed = onboardEmployeeInputSchema.parse(input);
        return onboardEmployeeOperation(this.runtime(), parsed);
    }

    async getEmployeeSummary(input: GetEmployeeSummaryInput): Promise<GetEmployeeSummaryResult> {
        const parsed = getEmployeeSummaryInputSchema.parse(input);
        return getEmployeeSummaryOperation(this.runtime(), parsed);
    }

    async updateEligibility(input: UpdateEligibilityInput): Promise<void> {
        const parsed = updateEligibilityInputSchema.parse(input);
        await updateEligibilityOperation(this.runtime(), parsed);
    }

    async terminateEmployee(input: TerminateEmployeeInput): Promise<void> {
        const parsed = terminateEmployeeInputSchema.parse(input);
        await terminateEmployeeOperation(this.runtime(), parsed);
    }

    async assignCompliancePack(input: AssignCompliancePackInput): Promise<void> {
        const parsed = assignCompliancePackInputSchema.parse(input);
        await assignCompliancePackOperation(this.runtime(), parsed);
    }

    private runtime(): PeopleOrchestrationRuntime {
        return {
            deps: this.deps,
            ensureOrgAccess: this.ensureOrgAccess.bind(this),
            execute: this.executeOperation.bind(this),
        };
    }

    private async executeOperation<T>(
        authorization: OrchestrationAuthorization,
        operation: string,
        metadata: Record<string, unknown> | undefined,
        handler: () => Promise<T>,
    ): Promise<T> {
        const context = this.buildContext(authorization, { metadata });
        return this.executeInServiceContext(context, operation, handler);
    }
}
