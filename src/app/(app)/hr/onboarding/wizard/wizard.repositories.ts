import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { PrismaOnboardingInvitationRepository } from '@/server/repositories/prisma/hr/onboarding';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization';
import { PrismaUserRepository } from '@/server/repositories/prisma/org/users';

export const profileRepository = new PrismaEmployeeProfileRepository();
export const invitationRepository = new PrismaOnboardingInvitationRepository();
export const organizationRepository = new PrismaOrganizationRepository({});
export const userRepository = new PrismaUserRepository();
