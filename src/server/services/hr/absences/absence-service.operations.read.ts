import type { GetAbsencesInput, GetAbsencesResult } from '@/server/use-cases/hr/absences/get-absences';
import type { AnalyzeAbsenceAttachmentInput } from '@/server/use-cases/hr/absences/analyze-absence-attachment';
import type { PresignAbsenceAttachmentInput } from '@/server/use-cases/hr/absences/presign-absence-attachment';
import type { PresignAbsenceAttachmentDownloadInput } from '@/server/use-cases/hr/absences/presign-absence-attachment-download';
import { getAbsences } from '@/server/use-cases/hr/absences/get-absences';
import { analyzeAbsenceAttachment } from '@/server/use-cases/hr/absences/analyze-absence-attachment';
import { presignAbsenceAttachment } from '@/server/use-cases/hr/absences/presign-absence-attachment';
import { presignAbsenceAttachmentDownload } from '@/server/use-cases/hr/absences/presign-absence-attachment-download';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';
import type { AbsenceServiceRuntime } from './absence-service.operations.types';

export async function handleListAbsences(
    runtime: AbsenceServiceRuntime,
    input: GetAbsencesInput,
): Promise<GetAbsencesResult> {
    await runtime.ensureOrgAccess(input.authorization, {
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_ABSENCE,
        resourceAttributes: { filters: input.filters },
    });
    const filtersMetadata = input.filters
        ? {
            ...input.filters,
            from: input.filters.from?.toISOString(),
            to: input.filters.to?.toISOString(),
        }
        : undefined;

    return runtime.runOperation(
        'hr.absences.list',
        input.authorization,
        filtersMetadata ? { filters: filtersMetadata } : undefined,
        () => getAbsences(runtime.dependencies, input),
    );
}

export async function handleAnalyzeAttachment(
    runtime: AbsenceServiceRuntime,
    input: AnalyzeAbsenceAttachmentInput,
) {
    await runtime.ensureOrgAccess(input.authorization, {
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_ABSENCE_AI_VALIDATION,
        resourceAttributes: { absenceId: input.absenceId },
    });
    return runtime.runOperation(
        'hr.absences.attachments.analyze',
        input.authorization,
        { absenceId: input.absenceId },
        () => analyzeAbsenceAttachment(runtime.dependencies, input),
    );
}

export async function handlePresignAbsenceAttachment(
    runtime: AbsenceServiceRuntime,
    input: PresignAbsenceAttachmentInput,
) {
    await runtime.ensureOrgAccess(input.authorization, {
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceAttributes: { absenceId: input.absenceId, fileName: input.fileName, fileSize: input.fileSize },
    });
    return runtime.runOperation(
        'hr.absences.attachments.presign',
        input.authorization,
        { absenceId: input.absenceId, fileName: input.fileName },
        () => presignAbsenceAttachment(runtime.dependencies, input),
    );
}

export async function handlePresignAbsenceAttachmentDownload(
    runtime: AbsenceServiceRuntime,
    input: PresignAbsenceAttachmentDownloadInput,
) {
    await runtime.ensureOrgAccess(input.authorization, {
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE_TYPE.ABSENCE_ATTACHMENT,
        resourceAttributes: { absenceId: input.absenceId, attachmentId: input.attachmentId },
    });
    return runtime.runOperation(
        'hr.absences.attachments.download',
        input.authorization,
        { absenceId: input.absenceId, attachmentId: input.attachmentId },
        () => presignAbsenceAttachmentDownload(runtime.dependencies, input),
    );
}
