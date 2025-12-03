import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgAbsenceActor } from '@/server/security/authorization/absences';
import type { DeleteUnplannedAbsencePayload } from '@/server/types/hr-absence-schemas';
import type { AbsenceDeletionAuditEntry } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import { toJsonValue } from './utils';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface DeleteUnplannedAbsenceDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface DeleteUnplannedAbsenceInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: DeleteUnplannedAbsencePayload;
}

export interface DeleteUnplannedAbsenceResult {
    deleted: true;
}

export async function deleteUnplannedAbsence(
    deps: DeleteUnplannedAbsenceDependencies,
    input: DeleteUnplannedAbsenceInput,
): Promise<DeleteUnplannedAbsenceResult> {
    const orgId = input.authorization.orgId;
    const absence = await deps.absenceRepository.getAbsence(orgId, input.absenceId);
    if (!absence) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }

    assertPrivilegedOrgAbsenceActor(input.authorization);

    if (absence.deletedAt) {
        throw new ValidationError('Absence has already been deleted.');
    }

    const trimmedReason = normalizeString(input.payload.reason)?.trim();
    if (!trimmedReason) {
        throw new ValidationError('A deletion reason is required.');
    }

    const audit: AbsenceDeletionAuditEntry = {
        orgId,
        absenceId: input.absenceId,
        reason: trimmedReason,
        deletedByUserId: input.authorization.userId,
        deletedAt: new Date(),
        metadata: toJsonValue(input.payload.metadata),
        dataClassification: input.authorization.dataClassification,
        residencyTag: input.authorization.dataResidency,
    };

    await deps.absenceRepository.deleteAbsence(orgId, input.absenceId, audit);

    await invalidateAbsenceScopeCache(input.authorization);

    return { deleted: true };
}
