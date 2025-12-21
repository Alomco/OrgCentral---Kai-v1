import { AuthorizationError, ValidationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgPermissionMap } from '@/server/security/access-control';
import { satisfiesAnyPermissionProfile } from './permission-utils';

const TRAINING_MANAGEMENT_ANY_PERMISSIONS: readonly OrgPermissionMap[] = [
    { organization: ['update'] },
    { audit: ['write'] },
];

export function canManageOrgTraining(context: RepositoryAuthorizationContext): boolean {
    return satisfiesAnyPermissionProfile(context.permissions, TRAINING_MANAGEMENT_ANY_PERMISSIONS);
}

export function assertTrainingActorOrPrivileged(
    context: RepositoryAuthorizationContext,
    targetUserId: string,
): void {
    if (context.userId === targetUserId || canManageOrgTraining(context)) {
        return;
    }
    throw new AuthorizationError('You are not allowed to manage this training record.');
}

export function assertPrivilegedTrainingActor(context: RepositoryAuthorizationContext): void {
    if (canManageOrgTraining(context)) {
        return;
    }
    throw new AuthorizationError('You do not have permission to manage organization training.');
}

export function assertValidTrainingDates(
    startDate: Date | undefined,
    endDate: Date | undefined | null,
): void {
    if (!startDate || !endDate) {
        return;
    }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new ValidationError('Training dates must be valid.');
    }
    if (endDate.getTime() < startDate.getTime()) {
        throw new ValidationError('Training end date must be on or after the start date.');
    }
}
