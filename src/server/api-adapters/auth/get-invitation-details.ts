import { z } from 'zod';
import { getInvitationService } from '@/server/services/auth/invitation-service';
import type { InvitationService } from '@/server/services/auth/invitation-service';
import type { GetInvitationDetailsResult } from '@/server/use-cases/auth/get-invitation-details';
import { fetchInvitationDetails } from '@/server/use-cases/auth/get-invitation-details-action';

const GetInvitationDetailsSchema = z.object({
    token: z.string().min(1, 'An invitation token is required'),
});

export type GetInvitationDetailsPayload = z.infer<typeof GetInvitationDetailsSchema>;

const invitationService = getInvitationService();

export async function getInvitationDetailsController(
    payload: unknown,
    service: InvitationService = invitationService,
): Promise<GetInvitationDetailsResult> {
    const input = GetInvitationDetailsSchema.parse(payload);
    return fetchInvitationDetails(input, { service });
}
