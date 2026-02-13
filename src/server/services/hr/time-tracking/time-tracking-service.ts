import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import {
    approveTimeEntry,
    type ApproveTimeEntryDependencies,
    type ApproveTimeEntryInput,
    type ApproveTimeEntryResult,
} from '@/server/use-cases/hr/time-tracking/approve-time-entry';
import {
    createTimeEntry,
    type CreateTimeEntryDependencies,
    type CreateTimeEntryInput,
    type CreateTimeEntryResult,
} from '@/server/use-cases/hr/time-tracking/create-time-entry';
import {
    getTimeEntry,
    type GetTimeEntryDependencies,
    type GetTimeEntryInput,
    type GetTimeEntryResult,
} from '@/server/use-cases/hr/time-tracking/get-time-entry';
import {
    listTimeEntries,
    type ListTimeEntriesDependencies,
    type ListTimeEntriesInput,
    type ListTimeEntriesResult,
} from '@/server/use-cases/hr/time-tracking/list-time-entries';
import {
    updateTimeEntry,
    type UpdateTimeEntryDependencies,
    type UpdateTimeEntryInput,
    type UpdateTimeEntryResult,
} from '@/server/use-cases/hr/time-tracking/update-time-entry';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type TimeTrackingServiceDependencies = ApproveTimeEntryDependencies &
    CreateTimeEntryDependencies &
    GetTimeEntryDependencies &
    ListTimeEntriesDependencies &
    UpdateTimeEntryDependencies;

export class TimeTrackingService extends AbstractHrService {
    constructor(private readonly dependencies: TimeTrackingServiceDependencies) {
        super();
    }

    async listTimeEntries(input: ListTimeEntriesInput): Promise<ListTimeEntriesResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE.TIME_ENTRY,
            resourceAttributes: { filters: input.filters },
        });
        const filters = input.filters
            ? {
                ...input.filters,
                from: input.filters.from?.toISOString(),
                to: input.filters.to?.toISOString(),
            }
            : undefined;

        return this.runOperation(
            'hr.time-tracking.list',
            input.authorization,
            filters ? { filters } : undefined,
            () => listTimeEntries(this.dependencies, input),
        );
    }

    async getTimeEntry(input: GetTimeEntryInput): Promise<GetTimeEntryResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.TIME_ENTRY,
            resourceAttributes: { entryId: input.entryId },
        });

        return this.runOperation(
            'hr.time-tracking.get',
            input.authorization,
            { entryId: input.entryId },
            () => getTimeEntry(this.dependencies, input),
        );
    }

    async createTimeEntry(input: CreateTimeEntryInput): Promise<CreateTimeEntryResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.TIME_ENTRY,
            resourceAttributes: { targetUserId: input.payload.userId },
        });

        return this.runOperation(
            'hr.time-tracking.create',
            input.authorization,
            { targetUserId: input.payload.userId },
            () => createTimeEntry(this.dependencies, input),
        );
    }

    async updateTimeEntry(input: UpdateTimeEntryInput): Promise<UpdateTimeEntryResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.TIME_ENTRY,
            resourceAttributes: { entryId: input.entryId },
        });

        return this.runOperation(
            'hr.time-tracking.update',
            input.authorization,
            { entryId: input.entryId },
            () => updateTimeEntry(this.dependencies, input),
        );
    }

    async approveTimeEntry(input: ApproveTimeEntryInput): Promise<ApproveTimeEntryResult> {
        const existingEntry = await this.dependencies.timeEntryRepository.getTimeEntry(
            input.authorization.orgId,
            input.entryId,
        );
        const resourceAttributes = {
            entryId: input.entryId,
            status: input.payload.status,
            targetUserId: existingEntry?.userId ?? null,
            entryStatus: existingEntry?.status ?? null,
        };
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.APPROVE,
            resourceType: HR_RESOURCE.TIME_ENTRY,
            resourceAttributes,
        });

        return this.runOperation(
            'hr.time-tracking.approve',
            input.authorization,
            { entryId: input.entryId, decision: input.payload.status ?? 'APPROVED' },
            () => approveTimeEntry(this.dependencies, input),
        );
    }

    private runOperation<TResult>(
        operation: string,
        authorization: RepositoryAuthorizationContext,
        metadata: Record<string, unknown> | undefined,
        handler: () => Promise<TResult>,
    ): Promise<TResult> {
        const context: ServiceExecutionContext = this.buildContext(authorization, { metadata });
        return this.executeInServiceContext(context, operation, handler);
    }
}
