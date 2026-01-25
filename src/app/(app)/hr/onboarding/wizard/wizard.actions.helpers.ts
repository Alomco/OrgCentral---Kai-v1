import type { ErrorDetails } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getRoleService } from '@/server/services/org';
import { resolveAllowedInviteRoles } from '@/server/services/org/membership/membership-service.policy';
import { BUILTIN_ROLE_KEYS } from '@/server/security/role-constants';

interface PendingInvitationDetails {
    kind: 'pending_invitation';
    token: string;
}

export function readPendingInvitationToken(details?: ErrorDetails): string | null {
    const candidate = details as PendingInvitationDetails | undefined;
    if (candidate?.kind === 'pending_invitation' && candidate.token.trim().length > 0) {
        return candidate.token;
    }
    return null;
}

export async function resolveInvitableRoleNames(
    authorization: RepositoryAuthorizationContext,
): Promise<string[]> {
    try {
        const roles = await getRoleService().listRoles({ authorization });
        return resolveAllowedInviteRoles(
            authorization,
            roles.map((role) => role.name),
        );
    } catch {
        return resolveAllowedInviteRoles(authorization, [...BUILTIN_ROLE_KEYS]);
    }
}
