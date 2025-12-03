import { z } from 'zod';
import { PrismaInvitationRepository } from '@/server/repositories/prisma/auth/invitations';
import { PrismaUserRepository } from '@/server/repositories/prisma/org/users';
import {
    getInvitationDetails,
    type GetInvitationDetailsDependencies,
    type GetInvitationDetailsResult,
} from '@/server/use-cases/auth/get-invitation-details';

const invitationRepository = new PrismaInvitationRepository();
const userRepository = new PrismaUserRepository();

const GetInvitationDetailsSchema = z.object({
    token: z.string().min(1, 'An invitation token is required'),
});

const defaultDependencies: GetInvitationDetailsDependencies = {
    invitationRepository,
    userRepository,
};

export type GetInvitationDetailsPayload = z.infer<typeof GetInvitationDetailsSchema>;

export async function getInvitationDetailsController(
    payload: unknown,
    dependencies: GetInvitationDetailsDependencies = defaultDependencies,
): Promise<GetInvitationDetailsResult> {
    const input = GetInvitationDetailsSchema.parse(payload);
    return getInvitationDetails(dependencies, input);
}
