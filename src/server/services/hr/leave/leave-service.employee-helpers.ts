import { EntityNotFoundError, ValidationError } from '@/server/errors';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { GetLeaveRequestsInput } from '@/server/use-cases/hr/leave';
import type { EmployeeProfileDTO } from '@/server/types/hr/people';

export async function ensureEmployeeByEmployeeNumber(
    profileRepository: IEmployeeProfileRepository,
    orgId: string,
    employeeNumber: string,
): Promise<EmployeeProfileDTO> {
    const normalizedEmployeeNumber = employeeNumber.trim();

    if (typeof profileRepository.findByEmployeeNumber !== 'function') {
        throw new ValidationError('Profile repository is misconfigured.');
    }

    const byEmployeeNumber = await profileRepository.findByEmployeeNumber(orgId, normalizedEmployeeNumber);
    if (byEmployeeNumber) {
        return byEmployeeNumber;
    }

    const byUserId = await profileRepository.getEmployeeProfileByUser(orgId, normalizedEmployeeNumber);
    if (byUserId) {
        return byUserId;
    }

    const byProfileId = await profileRepository.getEmployeeProfile(orgId, normalizedEmployeeNumber);
    if (byProfileId) {
        return byProfileId;
    }

    throw new EntityNotFoundError('Employee profile', { orgId, employeeNumber: normalizedEmployeeNumber });
}

export async function resolveEmployeeFromProfile(
    profileRepository: IEmployeeProfileRepository,
    authorization: RepositoryAuthorizationContext,
    userId: string,
    employeeId?: string,
    fallbackName?: string | null,
): Promise<{ employeeId: string; employeeName: string }> {
    const profile = await profileRepository.getEmployeeProfileByUser(authorization.orgId, userId);
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { orgId: authorization.orgId, userId });
    }
    if (!profile.employeeNumber) {
        throw new ValidationError('Employee profile is missing an employee number.');
    }
    if (
        employeeId &&
        employeeId !== profile.userId &&
        employeeId !== profile.employeeNumber &&
        employeeId !== profile.id
    ) {
        throw new ValidationError('Submitted employeeId does not match the employee profile.');
    }

    const displayName = profile.displayName ?? undefined;
    const composedName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
    const resolvedName = displayName ?? (composedName.length > 0 ? composedName : undefined);
    const employeeName = resolvedName ?? fallbackName ?? 'Employee';

    return { employeeId: profile.userId, employeeName };
}

export function serializeLeaveFilters(
    filters: GetLeaveRequestsInput['filters'] | undefined,
): Record<string, unknown> | undefined {
    if (!filters) {
        return undefined;
    }

    return {
        status: filters.status,
        startDate: filters.startDate?.toISOString(),
        endDate: filters.endDate?.toISOString(),
    };
}
