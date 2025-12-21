import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import {
    completeTraining,
    type CompleteTrainingDependencies,
    type CompleteTrainingInput,
    type CompleteTrainingResult,
} from '@/server/use-cases/hr/training/complete-training';
import {
    deleteTrainingRecord,
    type DeleteTrainingRecordDependencies,
    type DeleteTrainingRecordInput,
    type DeleteTrainingRecordResult,
} from '@/server/use-cases/hr/training/delete-training-record';
import {
    enrollTraining,
    type EnrollTrainingDependencies,
    type EnrollTrainingInput,
    type EnrollTrainingResult,
} from '@/server/use-cases/hr/training/enroll-training';
import {
    getTrainingRecord,
    type GetTrainingRecordDependencies,
    type GetTrainingRecordInput,
    type GetTrainingRecordResult,
} from '@/server/use-cases/hr/training/get-training-record';
import {
    listTrainingRecords,
    type ListTrainingRecordsDependencies,
    type ListTrainingRecordsInput,
    type ListTrainingRecordsResult,
} from '@/server/use-cases/hr/training/list-training-records';
import {
    updateTrainingRecord,
    type UpdateTrainingRecordDependencies,
    type UpdateTrainingRecordInput,
    type UpdateTrainingRecordResult,
} from '@/server/use-cases/hr/training/update-training-record';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export type TrainingServiceDependencies = CompleteTrainingDependencies &
    DeleteTrainingRecordDependencies &
    EnrollTrainingDependencies &
    GetTrainingRecordDependencies &
    ListTrainingRecordsDependencies &
    UpdateTrainingRecordDependencies;

export class TrainingService extends AbstractHrService {
    constructor(private readonly dependencies: TrainingServiceDependencies) {
        super();
    }

    async listTrainingRecords(input: ListTrainingRecordsInput): Promise<ListTrainingRecordsResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { filters: input.filters },
        });

        return this.runOperation(
            'hr.training.list',
            input.authorization,
            input.filters ? { filters: input.filters } : undefined,
            () => listTrainingRecords(this.dependencies, input),
        );
    }

    async getTrainingRecord(input: GetTrainingRecordInput): Promise<GetTrainingRecordResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { recordId: input.recordId },
        });

        return this.runOperation(
            'hr.training.get',
            input.authorization,
            { recordId: input.recordId },
            () => getTrainingRecord(this.dependencies, input),
        );
    }

    async enrollTraining(input: EnrollTrainingInput): Promise<EnrollTrainingResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { targetUserId: input.payload.userId, courseName: input.payload.courseName },
        });

        return this.runOperation(
            'hr.training.enroll',
            input.authorization,
            { targetUserId: input.payload.userId, course: input.payload.courseName },
            () => enrollTraining(this.dependencies, input),
        );
    }

    async updateTrainingRecord(
        input: UpdateTrainingRecordInput,
    ): Promise<UpdateTrainingRecordResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { recordId: input.recordId },
        });

        return this.runOperation(
            'hr.training.update',
            input.authorization,
            { recordId: input.recordId },
            () => updateTrainingRecord(this.dependencies, input),
        );
    }

    async completeTraining(input: CompleteTrainingInput): Promise<CompleteTrainingResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.ACKNOWLEDGE,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { recordId: input.recordId },
        });

        return this.runOperation(
            'hr.training.complete',
            input.authorization,
            { recordId: input.recordId },
            () => completeTraining(this.dependencies, input),
        );
    }

    async deleteTrainingRecord(
        input: DeleteTrainingRecordInput,
    ): Promise<DeleteTrainingRecordResult> {
        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.DELETE,
            resourceType: HR_RESOURCE.HR_TRAINING,
            resourceAttributes: { recordId: input.recordId },
        });

        return this.runOperation(
            'hr.training.delete',
            input.authorization,
            { recordId: input.recordId },
            () => deleteTrainingRecord(this.dependencies, input),
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
