import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgAbsenceActor } from '@/server/security/authorization';
import type { ApproveUnplannedAbsencePayload } from '@/server/types/hr-absence-schemas';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import { toJsonValue } from './utils';
import { invalidateAbsenceScopeCache } from './cache-helpers';

const DECISION_STATUSES: ReadonlySet<UnplannedAbsence['status']> = new Set([
    'APPROVED',
    'REJECTED',
    'CANCELLED',
]);

export interface ApproveUnplannedAbsenceDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface ApproveUnplannedAbsenceInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: ApproveUnplannedAbsencePayload;
}

export interface ApproveUnplannedAbsenceResult {
    absence: UnplannedAbsence;
}

export async function approveUnplannedAbsence(
    deps: ApproveUnplannedAbsenceDependencies,
    input: ApproveUnplannedAbsenceInput,
): Promise<ApproveUnplannedAbsenceResult> {
    assertPrivilegedOrgAbsenceActor(input.authorization);

    const current = await deps.absenceRepository.getAbsence(input.authorization.orgId, input.absenceId);
    if (!current) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }

    const status = input.payload.status ?? 'APPROVED';
    if (!DECISION_STATUSES.has(status)) {
        throw new ValidationError('Unsupported decision status for this operation.');
    }

    if (current.status !== 'REPORTED') {
        throw new ValidationError('Only reported absences can be updated.');
    }

    const updates: Parameters<IUnplannedAbsenceRepository['updateAbsence']>[2] = {
        status,
        approverOrgId: input.authorization.orgId,
        approverUserId: input.authorization.userId,
    };

    if ('reason' in input.payload) {
        updates.reason = normalizeString(input.payload.reason ?? undefined);
    }

    if ('healthStatus' in input.payload) {
        updates.healthStatus = input.payload.healthStatus ?? null;
    }

    if ('metadata' in input.payload) {
        updates.metadata = toJsonValue(input.payload.metadata);
    }

    const updated = await deps.absenceRepository.updateAbsence(
        input.authorization.orgId,
        input.absenceId,
        updates,
    );

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence: updated };
}
