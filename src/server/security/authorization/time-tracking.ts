import { AuthorizationError, ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { HR_ANY_PERMISSION_PROFILE } from '@/server/security/authorization/hr-permissions/composite';
import { satisfiesAnyPermissionProfile } from './permission-utils';

export function canManageOrgTimeEntries(context: RepositoryAuthorizationContext): boolean {
    return satisfiesAnyPermissionProfile(
        context.permissions,
        HR_ANY_PERMISSION_PROFILE.TIME_TRACKING_MANAGEMENT,
    );
}

export function canApproveOrgTimeEntries(context: RepositoryAuthorizationContext): boolean {
    return satisfiesAnyPermissionProfile(
        context.permissions,
        HR_ANY_PERMISSION_PROFILE.TIME_ENTRY_APPROVAL,
    );
}

export function canViewOrgTimeEntries(context: RepositoryAuthorizationContext): boolean {
    return canManageOrgTimeEntries(context) || canApproveOrgTimeEntries(context);
}

export function assertTimeEntryActorOrPrivileged(
    context: RepositoryAuthorizationContext,
    targetUserId: string,
): void {
    if (context.userId === targetUserId || canManageOrgTimeEntries(context)) {
        return;
    }

    throw new AuthorizationError('You are not allowed to act on behalf of this member.');
}

export function assertPrivilegedOrgTimeEntryActor(context: RepositoryAuthorizationContext): void {
    if (canManageOrgTimeEntries(context)) {
        return;
    }

    throw new AuthorizationError('You do not have permission to manage organization time entries.');
}

export function assertPrivilegedOrgTimeEntryApprover(context: RepositoryAuthorizationContext): void {
    if (canApproveOrgTimeEntries(context)) {
        return;
    }

    throw new AuthorizationError('You do not have permission to approve organization time entries.');
}

export function assertValidTimeWindow(clockIn: Date, clockOut?: Date | null): void {
    if (Number.isNaN(clockIn.getTime())) {
        throw new ValidationError('Clock-in time must be a valid date.');
    }

    if (!clockOut) {
        return;
    }

    if (Number.isNaN(clockOut.getTime())) {
        throw new ValidationError('Clock-out time must be a valid date.');
    }

    if (clockOut.getTime() <= clockIn.getTime()) {
        throw new ValidationError('Clock-out time must be after clock-in time.');
    }
}

