import type {
    InvitationRecord,
    InvitationStatusUpdate,
    InvitationCreateInput,
} from './invitation-repository.types';

export interface IInvitationRepository {
    findByToken(token: string): Promise<InvitationRecord | null>;
    getActiveInvitationByEmail(orgId: string, email: string): Promise<InvitationRecord | null>;
    listInvitationsByOrg(
        orgId: string,
        options?: { status?: InvitationRecord['status']; limit?: number },
    ): Promise<InvitationRecord[]>;
    createInvitation(input: InvitationCreateInput): Promise<InvitationRecord>;
    updateStatus(token: string, update: InvitationStatusUpdate): Promise<void>;
    revokeInvitation(orgId: string, token: string, revokedByUserId: string, reason?: string): Promise<void>;
}
