import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertActorOrPrivileged, assertValidDateRange } from '@/server/security/authorization';
import type { ReportUnplannedAbsencePayload } from '@/server/types/hr-absence-schemas';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';
import { normalizeString, assertNonEmpty } from '@/server/use-cases/shared';
import { calculateAbsenceHours, resolveHoursPerDay } from '@/server/domain/absences/time-calculations';
import { toJsonValue } from '@/server/domain/absences/conversions';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface ReportUnplannedAbsenceDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
    typeConfigRepository: IAbsenceTypeConfigRepository;
    absenceSettingsRepository: IAbsenceSettingsRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
}

export interface ReportUnplannedAbsenceInput {
    authorization: RepositoryAuthorizationContext;
    payload: ReportUnplannedAbsencePayload;
}

export interface ReportUnplannedAbsenceResult {
    absence: UnplannedAbsence;
}

export async function reportUnplannedAbsence(
    deps: ReportUnplannedAbsenceDependencies,
    input: ReportUnplannedAbsenceInput,
): Promise<ReportUnplannedAbsenceResult> {
    const orgId = input.authorization.orgId;
    const payload = sanitizePayload(input.payload);

    assertNonEmpty(payload.userId, 'Target member id');
    assertActorOrPrivileged(input.authorization, payload.userId);

    const absenceType = await resolveAbsenceType(deps, input.authorization, payload);
    if (!absenceType.isActive) {
        throw new ValidationError('Selected absence type is not active.');
    }

    const profile = await deps.employeeProfileRepository.getEmployeeProfileByUser(orgId, payload.userId);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { orgId, userId: payload.userId });
    }
    if (!profile.employeeNumber) {
        throw new ValidationError('Employee profile is missing an employee number.');
    }

    const startDate = payload.startDate;
    const endDate = payload.endDate ?? payload.startDate;
    assertValidDateRange(startDate, endDate);

    const hoursInDay = resolveHoursPerDay(await deps.absenceSettingsRepository.getSettings(input.authorization));
    const hours = calculateAbsenceHours({
        startDate,
        endDate,
        hoursPerDay: hoursInDay,
        hoursOverride: payload.hours ?? null,
    });

    const metadata = {
        ...(payload.metadata ?? {}),
        employeeNumber: profile.employeeNumber,
        employeeName: profile.displayName ?? undefined,
    };

    const absence = await deps.absenceRepository.createAbsence(input.authorization, {
        orgId,
        userId: payload.userId,
        typeId: absenceType.id,
        startDate,
        endDate,
        hours,
        reason: payload.reason,
        status: 'REPORTED',
        healthStatus: payload.healthStatus,
        dataClassification: input.authorization.dataClassification,
        residencyTag: input.authorization.dataResidency,
        metadata: toJsonValue(metadata),
    });

    await invalidateAbsenceScopeCache(input.authorization);

    return { absence };
}

function sanitizePayload(payload: ReportUnplannedAbsencePayload): ReportUnplannedAbsencePayload {
    return {
        ...payload,
        reason: normalizeString(payload.reason ?? undefined) ?? undefined,
        typeKey: payload.typeKey?.trim() ?? undefined,
    };
}

async function resolveAbsenceType(
    deps: ReportUnplannedAbsenceDependencies,
    authorization: RepositoryAuthorizationContext,
    payload: ReportUnplannedAbsencePayload,
) {
    if (payload.typeId) {
        const config = await deps.typeConfigRepository.getConfig(authorization, payload.typeId);
        if (!config) {
            throw new EntityNotFoundError('Absence type', { typeId: payload.typeId });
        }
        return config;
    }

    if (payload.typeKey) {
        const config = await deps.typeConfigRepository.getConfigByKey(authorization, payload.typeKey);
        if (!config) {
            throw new EntityNotFoundError('Absence type', { typeKey: payload.typeKey });
        }
        return config;
    }

    throw new ValidationError('An absence type identifier is required.');
}
