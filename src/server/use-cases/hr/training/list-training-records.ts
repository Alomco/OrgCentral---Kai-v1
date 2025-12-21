import { AuthorizationError, ValidationError } from '@/server/errors';
import type { ITrainingRecordRepository } from '@/server/repositories/contracts/hr/training/training-record-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { canManageOrgTraining } from '@/server/security/authorization';
import type { TrainingRecord } from '@/server/types/hr-types';
import type { TrainingRecordFilters } from '@/server/types/hr-training-schemas';
import { registerTrainingCache } from './cache-helpers';

// Use-case: list training records for an organization or employee via training repositories with filters.

export interface ListTrainingRecordsDependencies {
    trainingRepository: ITrainingRecordRepository;
}

export interface ListTrainingRecordsInput {
    authorization: RepositoryAuthorizationContext;
    filters?: TrainingRecordFilters;
}

export interface ListTrainingRecordsResult {
    records: TrainingRecord[];
}

type RepositoryFilters = NonNullable<
    Parameters<ITrainingRecordRepository['getTrainingRecordsByOrganization']>[1]
>;

export async function listTrainingRecords(
    deps: ListTrainingRecordsDependencies,
    input: ListTrainingRecordsInput,
): Promise<ListTrainingRecordsResult> {
    const normalizedFilters = normalizeFilters(input.filters);
    const scopedFilters = scopeFilters(input.authorization, normalizedFilters);

    registerTrainingCache(input.authorization);

    const records = await deps.trainingRepository.getTrainingRecordsByOrganization(
        input.authorization.orgId,
        scopedFilters,
    );

    return { records: enforceTenantVisibility(input.authorization, records) };
}

function normalizeFilters(filters?: TrainingRecordFilters): RepositoryFilters {
    if (!filters) {
        return {};
    }

    const trimmedStatus = filters.status?.trim();
    const trainingTitle = filters.trainingTitle?.trim();
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    const expiryAfter = filters.expiryAfter ? new Date(filters.expiryAfter) : undefined;
    const expiryBefore = filters.expiryBefore ? new Date(filters.expiryBefore) : undefined;
    const employeeId = filters.employeeId?.trim();
    const userId = filters.userId?.trim() ?? employeeId;

    if (startDate && endDate && startDate > endDate) {
        throw new ValidationError('startDate must be before or equal to endDate.');
    }
    if (expiryAfter && expiryBefore && expiryAfter > expiryBefore) {
        throw new ValidationError('expiryAfter must be before or equal to expiryBefore.');
    }

    return {
        status: trimmedStatus ?? undefined,
        trainingTitle: trainingTitle ?? undefined,
        startDate,
        endDate,
        expiryAfter,
        expiryBefore,
        employeeId: employeeId ?? undefined,
        userId: userId ?? undefined,
    };
}

function scopeFilters(
    authorization: RepositoryAuthorizationContext,
    filters: RepositoryFilters,
): RepositoryFilters {
    const requestedUserId = filters.userId ?? filters.employeeId;

    if (!requestedUserId && !canManageOrgTraining(authorization)) {
        return { ...filters, userId: authorization.userId };
    }

    if (
        requestedUserId &&
        requestedUserId !== authorization.userId &&
        !canManageOrgTraining(authorization)
    ) {
        throw new AuthorizationError('You cannot view training for other members.');
    }

    return {
        ...filters,
        userId: requestedUserId,
    };
}

function enforceTenantVisibility(
    authorization: RepositoryAuthorizationContext,
    records: TrainingRecord[],
): TrainingRecord[] {
    if (canManageOrgTraining(authorization)) {
        return records;
    }

    const scoped = records.filter((record) => record.userId === authorization.userId);
    if (scoped.length !== records.length) {
        throw new AuthorizationError('Filtered results contained records outside your scope.');
    }

    return scoped;
}
