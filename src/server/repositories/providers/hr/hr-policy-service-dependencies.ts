import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions, PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { PrismaHRPolicyRepository, PrismaPolicyAcknowledgmentRepository } from '@/server/repositories/prisma/hr/policies';
import { invalidateCache } from '@/server/lib/cache-tags';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import {
    CACHE_SCOPE_HR_POLICIES,
    CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS,
} from '@/server/repositories/cache-scopes';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { IHRPolicyRepository } from '@/server/repositories/contracts/hr/policies/hr-policy-repository-contract';
import type { IPolicyAcknowledgmentRepository } from '@/server/repositories/contracts/hr/policies/policy-acknowledgment-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';

function createHrPolicyInvalidator(
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
): NonNullable<BasePrismaRepositoryOptions['onAfterWrite']> {
    const orgRepo = new PrismaOrganizationRepository({ prisma: prismaOptions?.prisma });

    return async (
        orgId,
        scopes = [CACHE_SCOPE_HR_POLICIES, CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS],
    ) => {
        const organization = await orgRepo.getOrganization(orgId);
        const classification = organization?.dataClassification ?? 'OFFICIAL';
        const residency = organization?.dataResidency ?? 'UK_ONLY';
        const scopesToInvalidate = scopes.length > 0 ? scopes : [
            CACHE_SCOPE_HR_POLICIES,
            CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS,
        ];

        await Promise.all(
            scopesToInvalidate.map((scope) =>
                invalidateCache({
                    orgId,
                    scope,
                    classification,
                    residency,
                }),
            ),
        );
    };
}

export interface HrPolicyRepositoryDependencies {
  policyRepository: IHRPolicyRepository;
  acknowledgmentRepository: IPolicyAcknowledgmentRepository;
  employeeProfileRepository: IEmployeeProfileRepository;
}

export type Overrides = Partial<HrPolicyRepositoryDependencies>;

export interface HrPolicyServiceDependencyOptions {
  prismaOptions?: PrismaOptions;
  overrides?: Overrides;
}

export function buildHrPolicyServiceDependencies(
  options?: HrPolicyServiceDependencyOptions,
): HrPolicyRepositoryDependencies {
  const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
  const onAfterWrite: NonNullable<BasePrismaRepositoryOptions['onAfterWrite']> =
      options?.prismaOptions?.onAfterWrite ??
      createHrPolicyInvalidator(options?.prismaOptions);

  const repoOptions: OrgScopedRepositoryOptions = {
    prisma: prismaClient,
    trace: options?.prismaOptions?.trace,
    onAfterWrite,
  };

  return {
    policyRepository:
      options?.overrides?.policyRepository ?? new PrismaHRPolicyRepository(repoOptions),
    acknowledgmentRepository:
      options?.overrides?.acknowledgmentRepository ?? new PrismaPolicyAcknowledgmentRepository(repoOptions),
    employeeProfileRepository:
      options?.overrides?.employeeProfileRepository ?? new PrismaEmployeeProfileRepository(repoOptions),
  };
}
