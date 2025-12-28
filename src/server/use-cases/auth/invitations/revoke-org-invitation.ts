import type { IInvitationRepository } from '@/server/repositories/contracts/auth/invitations';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { normalizeToken } from '@/server/use-cases/shared';

export interface RevokeOrgInvitationDependencies {
    invitationRepository: IInvitationRepository;
}

export interface RevokeOrgInvitationInput {
    authorization: RepositoryAuthorizationContext;
    token: string;
    reason?: string;
}

export interface RevokeOrgInvitationResult {
    success: true;
}

export async function revokeOrgInvitation(
    deps: RevokeOrgInvitationDependencies,
    input: RevokeOrgInvitationInput,
): Promise<RevokeOrgInvitationResult> {
    const token = normalizeToken(input.token);
    const reason = input.reason?.trim();

    await deps.invitationRepository.revokeInvitation(
        input.authorization.orgId,
        token,
        input.authorization.userId,
        reason,
    );

    return { success: true };
}
