import type { InvitationData, InvitationStatus } from '@/server/types/auth-types';

export interface InvitationRecord extends InvitationData {
    invitedByUserId?: string;
    acceptedAt?: Date;
    acceptedByUserId?: string;
    expiresAt?: Date;
    updatedAt?: Date;
}

export interface InvitationStatusUpdate {
    status: InvitationStatus;
    acceptedByUserId?: string;
    acceptedAt?: Date;
}
