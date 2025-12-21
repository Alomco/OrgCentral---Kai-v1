import type { AcceptInvitationResult } from '@/server/use-cases/auth/accept-invitation';
import {
    getMembershipService,
} from '@/server/services/org/membership/membership-service.provider';
import type {
    MembershipService,
    AcceptInvitationServiceInput,
} from '@/server/services/org/membership/membership-service';

export interface AcceptInvitationActionOptions {
    service?: MembershipService;
}

export async function processInvitationAcceptance(
    input: AcceptInvitationServiceInput,
    options?: AcceptInvitationActionOptions,
): Promise<AcceptInvitationResult> {
    const service = options?.service ?? getMembershipService();
    return service.acceptInvitation(input);
}
