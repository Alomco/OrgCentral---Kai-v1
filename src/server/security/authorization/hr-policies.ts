import { AuthorizationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgPermissionMap } from '@/server/security/access-control';
import { permissionsSatisfy } from './permission-utils';

const POLICY_ADMIN_REQUIRED_PERMISSIONS: OrgPermissionMap = { organization: ['update'] };

export function canManageOrgPolicies(context: RepositoryAuthorizationContext): boolean {
    return permissionsSatisfy(context.permissions, POLICY_ADMIN_REQUIRED_PERMISSIONS);
}

export function assertPrivilegedOrgPolicyActor(context: RepositoryAuthorizationContext): void {
    if (canManageOrgPolicies(context)) {
        return;
    }

    throw new AuthorizationError('You do not have permission to manage organization-wide HR policies.');
}

export function assertPolicyAcknowledgmentActor(
    context: RepositoryAuthorizationContext,
    targetUserId: string,
): void {
    if (context.userId === targetUserId) {
        return;
    }

    throw new AuthorizationError('Cannot act on behalf of a different user for HR policy acknowledgments.');
}
