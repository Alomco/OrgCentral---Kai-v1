export interface InvitationFormData {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    role: string;
}

export interface PendingInvite {
    id: string;
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'expired';
    sentAt: Date;
    expiresAt: Date;
}
