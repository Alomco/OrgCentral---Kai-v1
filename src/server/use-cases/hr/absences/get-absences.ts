import { AuthorizationError, ValidationError } from '@/server/errors';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import { registerOrgCacheTag } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_ABSENCES } from '@/server/repositories/cache-scopes';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { canManageOrgAbsences } from '@/server/security/authorization';
import type { UnplannedAbsence } from '@/server/types/hr-ops-types';

export interface GetAbsencesFilters {
    userId?: string;
    status?: UnplannedAbsence['status'];
    includeClosed?: boolean;
    from?: Date;
    to?: Date;
}

interface NormalizedAbsenceFilters extends GetAbsencesFilters {
    includeClosed: boolean;
}

export interface GetAbsencesDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
}

export interface GetAbsencesInput {
    authorization: RepositoryAuthorizationContext;
    filters?: GetAbsencesFilters;
}

export interface GetAbsencesResult {
    absences: UnplannedAbsence[];
}

export async function getAbsences(
    deps: GetAbsencesDependencies,
    input: GetAbsencesInput,
): Promise<GetAbsencesResult> {
    const normalizedFilters = normalizeFilters(input.filters);
    const scopedFilters = scopeFilters(input.authorization, normalizedFilters);

    registerOrgCacheTag(
        input.authorization.orgId,
        CACHE_SCOPE_ABSENCES,
        input.authorization.dataClassification,
        input.authorization.dataResidency,
    );

    const absences = await deps.absenceRepository.listAbsences(
        input.authorization.orgId,
        scopedFilters,
    );

    return { absences };
}

function normalizeFilters(filters?: GetAbsencesFilters): NormalizedAbsenceFilters {
    if (!filters) {
        return { includeClosed: false };
    }

    const includeClosed = filters.includeClosed ?? false;
    const scopedUserId = filters.userId?.trim();
    const normalized: NormalizedAbsenceFilters = {
        includeClosed,
        status: filters.status,
        userId: scopedUserId && scopedUserId.length > 0 ? scopedUserId : undefined,
        from: coerceDate(filters.from, 'from'),
        to: coerceDate(filters.to, 'to'),
    };

    if (normalized.from && normalized.to && normalized.from > normalized.to) {
        throw new ValidationError('The "from" date must be before the "to" date.');
    }

    return normalized;
}

function coerceDate(value: Date | undefined, field: 'from' | 'to'): Date | undefined {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new ValidationError(`Invalid ${field} date.`);
    }
    return date;
}

function scopeFilters(
    authorization: RepositoryAuthorizationContext,
    filters: NormalizedAbsenceFilters,
): NormalizedAbsenceFilters {
    const requestedUserId = filters.userId;

    if (!requestedUserId && !canManageOrgAbsences(authorization)) {
        return { ...filters, userId: authorization.userId };
    }

    if (
        requestedUserId &&
        requestedUserId !== authorization.userId &&
        !canManageOrgAbsences(authorization)
    ) {
        throw new AuthorizationError('You cannot view absences for other members.');
    }

    return filters;
}
