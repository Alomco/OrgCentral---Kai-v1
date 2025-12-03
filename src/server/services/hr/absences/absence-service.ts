import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import {
    acknowledgeUnplannedAbsence,
    type AcknowledgeUnplannedAbsenceDependencies,
    type AcknowledgeUnplannedAbsenceInput,
    type AcknowledgeUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/acknowledge-unplanned-absence';
import {
    addAbsenceAttachments,
    type AddAbsenceAttachmentsDependencies,
    type AddAbsenceAttachmentsInput,
    type AddAbsenceAttachmentsResult,
} from '@/server/use-cases/hr/absences/add-absence-attachments';
import {
    cancelUnplannedAbsence,
    type CancelUnplannedAbsenceDependencies,
    type CancelUnplannedAbsenceInput,
    type CancelUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/cancel-unplanned-absence';
import {
    removeAbsenceAttachment,
    type RemoveAbsenceAttachmentDependencies,
    type RemoveAbsenceAttachmentInput,
    type RemoveAbsenceAttachmentResult,
} from '@/server/use-cases/hr/absences/remove-absence-attachment';
import {
    reportUnplannedAbsence,
    type ReportUnplannedAbsenceDependencies,
    type ReportUnplannedAbsenceInput,
    type ReportUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/report-unplanned-absence';
import {
    approveUnplannedAbsence,
    type ApproveUnplannedAbsenceDependencies,
    type ApproveUnplannedAbsenceInput,
    type ApproveUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/approve-unplanned-absence';
import {
    updateUnplannedAbsence,
    type UpdateUnplannedAbsenceDependencies,
    type UpdateUnplannedAbsenceInput,
    type UpdateUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/update-unplanned-absence';
import {
    recordReturnToWork,
    type RecordReturnToWorkDependencies,
    type RecordReturnToWorkInput,
    type RecordReturnToWorkResult,
} from '@/server/use-cases/hr/absences/record-return-to-work';
import {
    deleteUnplannedAbsence,
    type DeleteUnplannedAbsenceDependencies,
    type DeleteUnplannedAbsenceInput,
    type DeleteUnplannedAbsenceResult,
} from '@/server/use-cases/hr/absences/delete-unplanned-absence';
import {
    getAbsences,
    type GetAbsencesDependencies,
    type GetAbsencesInput,
    type GetAbsencesResult,
} from '@/server/use-cases/hr/absences/get-absences';
import {
    updateAbsenceSettings,
    type UpdateAbsenceSettingsDependencies,
    type UpdateAbsenceSettingsInput,
    type UpdateAbsenceSettingsResult,
} from '@/server/use-cases/hr/absences/update-absence-settings';
import {
    analyzeAbsenceAttachment,
    type AnalyzeAbsenceAttachmentDependencies,
    type AnalyzeAbsenceAttachmentInput,
} from '@/server/use-cases/hr/absences/analyze-absence-attachment';

export type AbsenceServiceDependencies = AcknowledgeUnplannedAbsenceDependencies &
    AddAbsenceAttachmentsDependencies &
    ApproveUnplannedAbsenceDependencies &
    CancelUnplannedAbsenceDependencies &
    DeleteUnplannedAbsenceDependencies &
    GetAbsencesDependencies &
    RecordReturnToWorkDependencies &
    RemoveAbsenceAttachmentDependencies &
    ReportUnplannedAbsenceDependencies &
    UpdateAbsenceSettingsDependencies &
    UpdateUnplannedAbsenceDependencies &
    AnalyzeAbsenceAttachmentDependencies;

export class AbsenceService extends AbstractHrService {
    constructor(private readonly dependencies: AbsenceServiceDependencies) {
        super();
    }

    async listAbsences(input: GetAbsencesInput): Promise<GetAbsencesResult> {
        await this.ensureOrgAccess(input.authorization);
        const filtersMetadata = input.filters
            ? {
                ...input.filters,
                from: input.filters.from?.toISOString(),
                to: input.filters.to?.toISOString(),
            }
            : undefined;

        return this.runOperation(
            'hr.absences.list',
            input.authorization,
            filtersMetadata ? { filters: filtersMetadata } : undefined,
            () => getAbsences(this.dependencies, input),
        );
    }

    async reportAbsence(input: ReportUnplannedAbsenceInput): Promise<ReportUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.report',
            input.authorization,
            { targetUserId: input.payload.userId },
            () => reportUnplannedAbsence(this.dependencies, input),
        );
    }

    async approveAbsence(input: ApproveUnplannedAbsenceInput): Promise<ApproveUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        const decision = input.payload.status ?? 'APPROVED';
        return this.runOperation(
            'hr.absences.approve',
            input.authorization,
            {
                absenceId: input.absenceId,
                decision,
            },
            () => approveUnplannedAbsence(this.dependencies, input),
        );
    }

    async updateAbsence(input: UpdateUnplannedAbsenceInput): Promise<UpdateUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.update',
            input.authorization,
            { absenceId: input.absenceId },
            () => updateUnplannedAbsence(this.dependencies, input),
        );
    }

    async addAttachments(input: AddAbsenceAttachmentsInput): Promise<AddAbsenceAttachmentsResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.attachments.add',
            input.authorization,
            {
                absenceId: input.absenceId,
                attachmentCount: input.payload.attachments.length,
            },
            () => addAbsenceAttachments(this.dependencies, input),
        );
    }

    async removeAttachment(
        input: RemoveAbsenceAttachmentInput,
    ): Promise<RemoveAbsenceAttachmentResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.attachments.remove',
            input.authorization,
            {
                absenceId: input.absenceId,
                attachmentId: input.payload.attachmentId,
            },
            () => removeAbsenceAttachment(this.dependencies, input),
        );
    }

    async recordReturnToWork(input: RecordReturnToWorkInput): Promise<RecordReturnToWorkResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.return-to-work.record',
            input.authorization,
            {
                absenceId: input.absenceId,
                returnDate: input.payload.returnDate.toISOString(),
            },
            () => recordReturnToWork(this.dependencies, input),
        );
    }

    async deleteAbsence(input: DeleteUnplannedAbsenceInput): Promise<DeleteUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation(
            'hr.absences.delete',
            input.authorization,
            { absenceId: input.absenceId },
            () => deleteUnplannedAbsence(this.dependencies, input),
        );
    }

    async acknowledgeAbsence(input: AcknowledgeUnplannedAbsenceInput): Promise<AcknowledgeUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation('hr.absences.acknowledge', input.authorization, { absenceId: input.absenceId }, () =>
            acknowledgeUnplannedAbsence(this.dependencies, input),
        );
    }

    async cancelAbsence(input: CancelUnplannedAbsenceInput): Promise<CancelUnplannedAbsenceResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation('hr.absences.cancel', input.authorization, { absenceId: input.absenceId }, () =>
            cancelUnplannedAbsence(this.dependencies, input),
        );
    }

    async updateSettings(input: UpdateAbsenceSettingsInput): Promise<UpdateAbsenceSettingsResult> {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation('hr.absences.settings.update', input.authorization, undefined, () =>
            updateAbsenceSettings(this.dependencies, input),
        );
    }

    async analyzeAttachment(input: AnalyzeAbsenceAttachmentInput) {
        await this.ensureOrgAccess(input.authorization);
        return this.runOperation('hr.absences.attachments.analyze', input.authorization, { absenceId: input.absenceId }, () =>
            analyzeAbsenceAttachment(this.dependencies, input),
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
