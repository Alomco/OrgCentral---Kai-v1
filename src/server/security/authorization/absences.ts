import { AuthorizationError, ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgPermissionMap } from '@/server/security/access-control';
import { satisfiesAnyPermissionProfile } from './permission-utils';

const ABSENCE_MANAGEMENT_ANY_PERMISSIONS: readonly OrgPermissionMap[] = [
    { organization: ['update'] },
    { audit: ['write'] },
];

export function canManageOrgAbsences(context: RepositoryAuthorizationContext): boolean {
    return satisfiesAnyPermissionProfile(context.permissions, ABSENCE_MANAGEMENT_ANY_PERMISSIONS);
}

export function assertActorOrPrivileged(
    context: RepositoryAuthorizationContext,
    targetUserId: string,
): void {
    if (context.userId === targetUserId || canManageOrgAbsences(context)) {
        return;
    }
    throw new AuthorizationError('You are not allowed to act on behalf of this member.');
}

export function assertPrivilegedOrgAbsenceActor(context: RepositoryAuthorizationContext): void {
    if (canManageOrgAbsences(context)) {
        return;
    }
    throw new AuthorizationError('You do not have permission to manage organization-wide absences.');
}

export function assertValidDateRange(start: Date, end: Date): void {
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new ValidationError('Absence dates must be valid.');
    }
    if (start.getTime() > end.getTime()) {
        throw new ValidationError('Start date must be before or equal to end date.');
    }
}
