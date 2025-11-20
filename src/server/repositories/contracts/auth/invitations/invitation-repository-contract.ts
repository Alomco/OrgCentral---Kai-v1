import type {
    InvitationRecord,
    InvitationStatusUpdate,
} from './invitation-repository.types';

export interface IInvitationRepository {
    findByToken(token: string): Promise<InvitationRecord | null>;
    updateStatus(token: string, update: InvitationStatusUpdate): Promise<void>;
}
