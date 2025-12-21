import type {
    InvitationRecord,
    InvitationStatusUpdate,
    InvitationCreateInput,
} from './invitation-repository.types';

export interface IInvitationRepository {
    findByToken(token: string): Promise<InvitationRecord | null>;
    getActiveInvitationByEmail(orgId: string, email: string): Promise<InvitationRecord | null>;
    createInvitation(input: InvitationCreateInput): Promise<InvitationRecord>;
    updateStatus(token: string, update: InvitationStatusUpdate): Promise<void>;
}
