export type AcceptInvitationActionState =
    | { status: 'idle' }
    | {
        status: 'success';
        organizationName: string;
        alreadyMember: boolean;
        requiresSetup: boolean;
        nextPath: string;
    }
    | { status: 'error'; message: string };

export const initialAcceptInvitationState: AcceptInvitationActionState = { status: 'idle' };
