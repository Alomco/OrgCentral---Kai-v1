import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertActorOrPrivileged } from '@/server/security/authorization/absences';
import type { AddAbsenceAttachmentPayload } from '@/server/types/hr-absence-schemas';
import type { AbsenceAttachmentInput, UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import { toJsonValue } from './utils';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface AddAbsenceAttachmentsDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface AddAbsenceAttachmentsInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: AddAbsenceAttachmentPayload;
}

export interface AddAbsenceAttachmentsResult {
    absence: UnplannedAbsence;
}

export async function addAbsenceAttachments(
    deps: AddAbsenceAttachmentsDependencies,
    input: AddAbsenceAttachmentsInput,
): Promise<AddAbsenceAttachmentsResult> {
    const absence = await deps.absenceRepository.getAbsence(input.authorization.orgId, input.absenceId);
    if (!absence) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }

    if (absence.deletedAt) {
        throw new ValidationError('Deleted absences cannot accept attachments.');
    }

    assertActorOrPrivileged(input.authorization, absence.userId);

    const attachments = input.payload.attachments.map<AbsenceAttachmentInput>((attachment) => {
        const fileName = normalizeString(attachment.fileName)?.trim();
        if (!fileName) {
            throw new ValidationError('Attachment names cannot be empty.');
        }

        return {
            orgId: input.authorization.orgId,
            absenceId: input.absenceId,
            fileName,
            storageKey: attachment.storageKey.trim(),
            contentType: attachment.contentType,
            fileSize: attachment.fileSize,
            checksum: attachment.checksum?.trim() ?? undefined,
            uploadedByUserId: input.authorization.userId,
            uploadedAt: new Date(),
            metadata: toJsonValue(attachment.metadata),
            dataClassification: input.authorization.dataClassification,
            residencyTag: input.authorization.dataResidency,
        };
    });

    const result = await deps.absenceRepository.addAttachments(
        input.authorization.orgId,
        input.absenceId,
        attachments,
    );

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence: result };
}
