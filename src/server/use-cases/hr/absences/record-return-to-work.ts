import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertActorOrPrivileged } from '@/server/security/authorization/absences';
import type { ReturnToWorkPayload } from '@/server/types/hr-absence-schemas';
import type { ReturnToWorkRecordInput, UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import { toJsonValue } from './utils';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface RecordReturnToWorkDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface RecordReturnToWorkInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: ReturnToWorkPayload;
}

export interface RecordReturnToWorkResult {
    absence: UnplannedAbsence;
}

export async function recordReturnToWork(
    deps: RecordReturnToWorkDependencies,
    input: RecordReturnToWorkInput,
): Promise<RecordReturnToWorkResult> {
    const orgId = input.authorization.orgId;
    const absence = await deps.absenceRepository.getAbsence(orgId, input.absenceId);
    if (!absence) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }

    if (absence.deletedAt) {
        throw new ValidationError('Return-to-work records cannot be applied to deleted absences.');
    }

    assertActorOrPrivileged(input.authorization, absence.userId);

    if (input.payload.returnDate.getTime() < absence.startDate.getTime()) {
        throw new ValidationError('Return date cannot be earlier than the absence start date.');
    }

    const record: ReturnToWorkRecordInput = {
        orgId,
        absenceId: input.absenceId,
        returnDate: input.payload.returnDate,
        comments: normalizeString(input.payload.comments ?? undefined) ?? undefined,
        submittedByUserId: input.authorization.userId,
        submittedAt: new Date(),
        metadata: toJsonValue(input.payload.metadata),
        dataClassification: input.authorization.dataClassification,
        residencyTag: input.authorization.dataResidency,
    };

    const updated = await deps.absenceRepository.recordReturnToWork(orgId, input.absenceId, record);

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence: updated };
}
