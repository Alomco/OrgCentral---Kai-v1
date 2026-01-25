import { ValidationError } from '@/server/errors';
import { AbsenceAttachmentNotFoundError } from '@/server/errors/hr-absences';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbsenceAttachment } from '@/server/types/hr-ops-types';

export interface GetAbsenceAttachmentDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface GetAbsenceAttachmentInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    attachmentId: string;
}

export interface GetAbsenceAttachmentResult {
    attachment: AbsenceAttachment;
}

export async function getAbsenceAttachment(
    deps: GetAbsenceAttachmentDependencies,
    input: GetAbsenceAttachmentInput,
): Promise<GetAbsenceAttachmentResult> {
    const absence = await deps.absenceRepository.getAbsence(input.authorization, input.absenceId);
    if (!absence) {
        throw new ValidationError('Absence not found.');
    }

    if (absence.deletedAt) {
        throw new ValidationError('Absence attachments are unavailable for deleted records.');
    }

    const attachment = (absence.attachments ?? []).find((item) => item.id === input.attachmentId);
    if (!attachment) {
        throw new AbsenceAttachmentNotFoundError('Attachment not found for download.', {
            absenceId: input.absenceId,
            attachmentId: input.attachmentId,
        });
    }

    return { attachment };
}
