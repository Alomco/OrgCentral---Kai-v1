import { EntityNotFoundError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertActorOrPrivileged } from '@/server/security/authorization/absences';
import type { RemoveAbsenceAttachmentPayload } from '@/server/types/hr-absence-schemas';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface RemoveAbsenceAttachmentDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface RemoveAbsenceAttachmentInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: RemoveAbsenceAttachmentPayload;
}

export interface RemoveAbsenceAttachmentResult {
    absence: UnplannedAbsence;
}

export async function removeAbsenceAttachment(
    deps: RemoveAbsenceAttachmentDependencies,
    input: RemoveAbsenceAttachmentInput,
): Promise<RemoveAbsenceAttachmentResult> {
    const absence = await deps.absenceRepository.getAbsence(input.authorization.orgId, input.absenceId);
    if (!absence) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }

    assertActorOrPrivileged(input.authorization, absence.userId);

    const updated = await deps.absenceRepository.removeAttachment(
        input.authorization.orgId,
        input.absenceId,
        input.payload.attachmentId,
    );

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence: updated };
}
