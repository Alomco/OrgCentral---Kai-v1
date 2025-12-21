import type {
    GetInvitationDetailsInput,
    GetInvitationDetailsResult,
} from '@/server/use-cases/auth/get-invitation-details';
import { getInvitationService, type InvitationService } from '@/server/services/auth/invitation-service';

export interface FetchInvitationDetailsOptions {
    service?: InvitationService;
}

export async function fetchInvitationDetails(
    input: GetInvitationDetailsInput,
    options?: FetchInvitationDetailsOptions,
): Promise<GetInvitationDetailsResult> {
    const service = options?.service ?? getInvitationService();
    return service.getDetails(input);
}
