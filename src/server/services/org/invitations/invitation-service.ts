import { createInvitationRepository } from '@/server/repositories/providers/auth/invitation-repository-provider';
import { listOrgInvitations } from '@/server/use-cases/auth/invitations/list-org-invitations';
import { revokeOrgInvitation } from '@/server/use-cases/auth/invitations/revoke-org-invitation';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getInvitationEmailDependencies } from '@/server/use-cases/notifications/invitation-email.provider';
import { resendInvitationEmail } from '@/server/use-cases/notifications/resend-invitation-email';
import type { InvitationStatus } from '@/server/types/auth-types';

export async function listInvitations(
    authorization: RepositoryAuthorizationContext,
    status?: InvitationStatus,
    limit?: number,
) {
    const invitationRepository = createInvitationRepository();
    return listOrgInvitations({ invitationRepository }, { authorization, status, limit });
}

export async function revokeInvitation(
    authorization: RepositoryAuthorizationContext,
    token: string,
    reason?: string,
) {
    const invitationRepository = createInvitationRepository();
    return revokeOrgInvitation({ invitationRepository }, { authorization, token, reason });
}

export async function resendInvitation(
    authorization: RepositoryAuthorizationContext,
    token: string,
) {
    const dependencies = getInvitationEmailDependencies();
    return resendInvitationEmail(dependencies, { authorization, invitationToken: token });
}
