import type { InvitationStatus } from '@/server/types/auth-types';
import type { IInvitationRepository } from '@/server/repositories/contracts/auth/invitations';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export interface ListOrgInvitationsDependencies {
    invitationRepository: IInvitationRepository;
}

export interface ListOrgInvitationsInput {
    authorization: RepositoryAuthorizationContext;
    status?: InvitationStatus;
    limit?: number;
}

export interface OrgInvitationSummary {
    token: string;
    targetEmail: string;
    status: InvitationStatus;
    invitedByUserId?: string;
    createdAt?: Date;
    expiresAt?: Date;
    roles: string[];
}

export interface ListOrgInvitationsResult {
    invitations: OrgInvitationSummary[];
}

export async function listOrgInvitations(
    deps: ListOrgInvitationsDependencies,
    input: ListOrgInvitationsInput,
): Promise<ListOrgInvitationsResult> {
    const records = await deps.invitationRepository.listInvitationsByOrg(input.authorization.orgId, {
        status: input.status,
        limit: input.limit,
    });

    return {
        invitations: records.map((record) => ({
            token: record.token,
            targetEmail: record.targetEmail,
            status: record.status,
            invitedByUserId: record.invitedByUserId ?? record.invitedByUid,
            createdAt: record.createdAt,
            expiresAt: record.expiresAt,
            roles: record.onboardingData.roles ?? [],
        })),
    };
}
