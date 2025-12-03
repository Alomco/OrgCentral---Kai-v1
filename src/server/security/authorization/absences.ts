import { AuthorizationError, ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgRoleKey } from '@/server/security/access-control';

const ORG_ABSENCE_ROLES: readonly OrgRoleKey[] = ['owner', 'orgAdmin', 'compliance'];

export function canManageOrgAbsences(context: RepositoryAuthorizationContext): boolean {
    return ORG_ABSENCE_ROLES.includes(context.roleKey as OrgRoleKey);
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
