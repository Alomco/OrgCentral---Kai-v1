import { AuthorizationError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

const TEMPLATE_MANAGER_ROLES = new Set(['orgAdmin', 'owner', 'hrAdmin']);

export function assertChecklistTemplateManager(
    authorization: RepositoryAuthorizationContext,
): void {
    const role = authorization.roleKey;
    if (!TEMPLATE_MANAGER_ROLES.has(role)) {
        throw new AuthorizationError('You do not have permission to manage checklist templates.');
    }
}
