import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IMentorAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/mentor-assignment-repository-contract';
import type { IProvisioningTaskRepository } from '@/server/repositories/contracts/hr/onboarding/provisioning-task-repository-contract';
import type { IDocumentTemplateAssignmentRepository } from '@/server/repositories/contracts/hr/onboarding/document-template-assignment-repository-contract';
import {
    PrismaMentorAssignmentRepository,
    PrismaProvisioningTaskRepository,
    PrismaDocumentTemplateAssignmentRepository,
} from '@/server/repositories/prisma/hr/onboarding';

export interface OnboardingAutomationRepositoryDependencies {
    mentorAssignmentRepository: IMentorAssignmentRepository;
    provisioningTaskRepository: IProvisioningTaskRepository;
    documentTemplateAssignmentRepository: IDocumentTemplateAssignmentRepository;
}

export interface OnboardingAutomationRepositoryDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<OnboardingAutomationRepositoryDependencies>;
}

export function buildOnboardingAutomationRepositoryDependencies(
    options?: OnboardingAutomationRepositoryDependencyOptions,
): OnboardingAutomationRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        mentorAssignmentRepository:
            options?.overrides?.mentorAssignmentRepository ?? new PrismaMentorAssignmentRepository(repoOptions),
        provisioningTaskRepository:
            options?.overrides?.provisioningTaskRepository ?? new PrismaProvisioningTaskRepository(repoOptions),
        documentTemplateAssignmentRepository:
            options?.overrides?.documentTemplateAssignmentRepository ??
            new PrismaDocumentTemplateAssignmentRepository(repoOptions),
    };
}
