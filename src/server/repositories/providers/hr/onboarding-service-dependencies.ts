import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IOnboardingInvitationRepository } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import {
    PrismaChecklistInstanceRepository,
    PrismaChecklistTemplateRepository,
    PrismaOnboardingInvitationRepository,
} from '@/server/repositories/prisma/hr/onboarding';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';

export interface OnboardingRepositoryDependencies {
    checklistInstanceRepository: IChecklistInstanceRepository;
    checklistTemplateRepository: IChecklistTemplateRepository;
    onboardingInvitationRepository: IOnboardingInvitationRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
}

export type Overrides = Partial<OnboardingRepositoryDependencies>;

export interface OnboardingServiceDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Overrides;
}

export function buildOnboardingServiceDependencies(
    options?: OnboardingServiceDependencyOptions,
): OnboardingRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        checklistInstanceRepository:
            options?.overrides?.checklistInstanceRepository ??
            new PrismaChecklistInstanceRepository(repoOptions),
        checklistTemplateRepository:
            options?.overrides?.checklistTemplateRepository ??
            new PrismaChecklistTemplateRepository(repoOptions),
        onboardingInvitationRepository:
            options?.overrides?.onboardingInvitationRepository ??
            new PrismaOnboardingInvitationRepository(repoOptions),
        employeeProfileRepository:
            options?.overrides?.employeeProfileRepository ??
            new PrismaEmployeeProfileRepository(repoOptions),
    };
}
