/**
 * HR Offboarding Guards
 *
 * Guards for offboarding operations.
 *
 * @module hr-guards/offboarding
 */
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    HR_ACTION,
    HR_RESOURCE_TYPE,
    HR_PERMISSION_PROFILE,
    HR_ANY_PERMISSION_PROFILE,
} from '../hr-permissions';
import {
    assertHrAccess,
    hasAnyPermission,
    assertPrivileged,
    type HrGuardRequest,
} from './core';

export function canManageOffboarding(context: RepositoryAuthorizationContext): boolean {
    return hasAnyPermission(context, HR_ANY_PERMISSION_PROFILE.OFFBOARDING_MANAGEMENT);
}

export function assertOffboardingReader(request: HrGuardRequest): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(request.authorization, {
        action: HR_ACTION.READ,
        resourceType: HR_RESOURCE_TYPE.OFFBOARDING,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.OFFBOARDING_READ,
    });
}

export function assertOffboardingLister(request: HrGuardRequest): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(request.authorization, {
        action: HR_ACTION.LIST,
        resourceType: HR_RESOURCE_TYPE.OFFBOARDING,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.OFFBOARDING_LIST,
    });
}

export function assertOffboardingStarter(request: HrGuardRequest): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(request.authorization, {
        action: HR_ACTION.CREATE,
        resourceType: HR_RESOURCE_TYPE.OFFBOARDING,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.OFFBOARDING_START,
    });
}

export function assertOffboardingCompleter(request: HrGuardRequest): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(request.authorization, {
        action: HR_ACTION.COMPLETE,
        resourceType: HR_RESOURCE_TYPE.OFFBOARDING,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.OFFBOARDING_COMPLETE,
    });
}

export function assertOffboardingCanceler(request: HrGuardRequest): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(request.authorization, {
        action: HR_ACTION.CANCEL,
        resourceType: HR_RESOURCE_TYPE.OFFBOARDING,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.OFFBOARDING_CANCEL,
    });
}

export function assertPrivilegedOffboardingActor(context: RepositoryAuthorizationContext): void {
    assertPrivileged(
        context,
        HR_ANY_PERMISSION_PROFILE.OFFBOARDING_MANAGEMENT,
        'You do not have permission to manage offboarding workflows.',
    );
}
