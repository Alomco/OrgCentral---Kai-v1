import { z } from 'zod';
import { AuthorizationError } from '@/server/errors';
import {
    PrismaOnboardingInvitationRepository,
    PrismaChecklistTemplateRepository,
    PrismaChecklistInstanceRepository,
} from '@/server/repositories/prisma/hr/onboarding';
import { PrismaEmployeeProfileRepository, PrismaEmploymentContractRepository } from '@/server/repositories/prisma/hr/people';
import { PrismaMembershipRepository } from '@/server/repositories/prisma/org/membership/prisma-membership-repository';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { resolveBillingService } from '@/server/services/billing/billing-service.provider';
import {
    completeOnboardingInvite,
    type CompleteOnboardingInviteDependencies,
    type CompleteOnboardingInviteResult,
} from '@/server/use-cases/hr/onboarding/complete-onboarding-invite';

const payloadSchema = z
    .union([
        z.object({ inviteToken: z.string().min(1, 'Invitation token is required') }),
        z.object({ token: z.string().min(1, 'Invitation token is required') }),
    ])
    .transform((value) => ({ inviteToken: 'inviteToken' in value ? value.inviteToken : value.token }));

export interface CompleteOnboardingInvitePayload {
    inviteToken: string;
}

const defaultDependencies: CompleteOnboardingInviteDependencies = {
    onboardingInvitationRepository: new PrismaOnboardingInvitationRepository(),
    organizationRepository: new PrismaOrganizationRepository(),
    employeeProfileRepository: new PrismaEmployeeProfileRepository(),
    membershipRepository: new PrismaMembershipRepository(),
    billingService: resolveBillingService() ?? undefined,
    employmentContractRepository: new PrismaEmploymentContractRepository(),
    checklistTemplateRepository: new PrismaChecklistTemplateRepository(),
    checklistInstanceRepository: new PrismaChecklistInstanceRepository(),
};

export interface CompleteOnboardingInviteActor {
    userId?: string;
    email?: string;
}

export async function completeOnboardingInviteController(
    payload: unknown,
    actor: CompleteOnboardingInviteActor,
    dependencies: CompleteOnboardingInviteDependencies = defaultDependencies,
): Promise<CompleteOnboardingInviteResult> {
    const { inviteToken } = payloadSchema.parse(payload);
    const userId = actor.userId?.trim();
    if (!userId) {
        throw new AuthorizationError('Authenticated user id is required to accept onboarding invitations.');
    }
    const email = actor.email?.trim();
    if (!email) {
        throw new AuthorizationError('Authenticated email is required to accept onboarding invitations.');
    }

    return completeOnboardingInvite(dependencies, {
        inviteToken,
        userId,
        actorEmail: email,
    });
}
