import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertActorOrPrivileged, assertValidDateRange } from '@/server/security/authorization/absences';
import type { UpdateUnplannedAbsencePayload } from '@/server/types/hr-absence-schemas';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString } from '@/server/use-cases/shared';
import { calculateAbsenceHours, resolveHoursPerDay, toJsonValue, toNumber } from './utils';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface UpdateUnplannedAbsenceDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export interface UpdateUnplannedAbsenceInput {
    authorization: RepositoryAuthorizationContext;
    absenceId: string;
    payload: UpdateUnplannedAbsencePayload;
}

export interface UpdateUnplannedAbsenceResult {
    absence: UnplannedAbsence;
}

export async function updateUnplannedAbsence(
    deps: UpdateUnplannedAbsenceDependencies,
    input: UpdateUnplannedAbsenceInput,
): Promise<UpdateUnplannedAbsenceResult> {
    const { absenceRepository } = deps;
    const current = await absenceRepository.getAbsence(input.authorization.orgId, input.absenceId);
    if (!current) {
        throw new EntityNotFoundError('Absence', { absenceId: input.absenceId });
    }
    if (current.deletedAt) {
        throw new ValidationError('Deleted absences cannot be updated.');
    }

    assertActorOrPrivileged(input.authorization, current.userId);
    ensureEditableStatus(current.status);

    const startDate = input.payload.startDate ?? current.startDate;
    const endDate = input.payload.endDate ?? current.endDate;
    assertValidDateRange(startDate, endDate);

    const settings = await deps.absenceSettingsRepository.getSettings(input.authorization.orgId);
    const hoursPerDay = resolveHoursPerDay(settings);
    const startChanged = startDate.getTime() !== current.startDate.getTime();
    const endChanged = endDate.getTime() !== current.endDate.getTime();
    const hoursOverride = typeof input.payload.hours === 'number' ? input.payload.hours : null;
    const needsRecalculation = hoursOverride !== null || startChanged || endChanged;
    const nextHours = needsRecalculation
        ? calculateAbsenceHours({
            startDate,
            endDate,
            hoursOverride,
            hoursPerDay,
        })
        : toNumber(current.hours);

    const updates: Parameters<IUnplannedAbsenceRepository['updateAbsence']>[2] = {};

    if (input.payload.reason !== undefined) {
        updates.reason = normalizeString(input.payload.reason ?? undefined);
    }

    if (input.payload.healthStatus !== undefined) {
        updates.healthStatus = input.payload.healthStatus ?? null;
    }

    if (input.payload.metadata !== undefined) {
        updates.metadata = toJsonValue(input.payload.metadata);
    }

    if (startChanged) {
        updates.startDate = startDate;
    }

    if (endChanged) {
        updates.endDate = endDate;
    }

    const currentHoursNumber = toNumber(current.hours);
    if (nextHours !== currentHoursNumber) {
        updates.hours = nextHours;
    }

    if (Object.keys(updates).length === 0) {
        return { absence: current };
    }

    const updated = await absenceRepository.updateAbsence(
        input.authorization.orgId,
        input.absenceId,
        updates,
    );

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence: updated };
}

function ensureEditableStatus(status: UnplannedAbsence['status']): void {
    if (status === 'CANCELLED' || status === 'CLOSED') {
        throw new ValidationError('Closed or cancelled absences cannot be updated.');
    }
}
