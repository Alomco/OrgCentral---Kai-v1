import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { PrismaHRPolicyRepository, PrismaPolicyAcknowledgmentRepository } from '@/server/repositories/prisma/hr/policies';
import { invalidateCache } from '@/server/lib/cache-tags';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import {
    CACHE_SCOPE_HR_POLICIES,
    CACHE_SCOPE_HR_POLICY_ACKNOWLEDGMENTS,
} from '@/server/repositories/cache-scopes';
import { HrPolicyService } from './hr-policy-service';
import type { HrPolicyServiceContract, HrPolicyServiceDependencies } from './hr-policy-service.types';

export type { HrPolicyServiceContract };

export interface HrPolicyServiceProviderOptions {
    overrides?: Partial<HrPolicyServiceDependencies>;
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

const sharedDefaultOptions: HrPolicyServiceProviderOptions = {};

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

export function getHrPolicyService(
    options: HrPolicyServiceProviderOptions = sharedDefaultOptions,
): HrPolicyService {
    const prismaOptions = options.prismaOptions;
    const onAfterWrite: NonNullable<BasePrismaRepositoryOptions['onAfterWrite']> =
        prismaOptions?.onAfterWrite ??
        createHrPolicyInvalidator(prismaOptions);

    const repoOptions: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'> = {
        prisma: prismaOptions?.prisma,
        trace: prismaOptions?.trace,
        onAfterWrite,
    };

    const defaults: HrPolicyServiceDependencies = {
        policyRepository: new PrismaHRPolicyRepository(repoOptions),
        acknowledgmentRepository: new PrismaPolicyAcknowledgmentRepository(repoOptions),
        employeeProfileRepository: new PrismaEmployeeProfileRepository(repoOptions),
    };

    if (!options.overrides || Object.keys(options.overrides).length === 0) {
        return new HrPolicyService(defaults);
    }

    return new HrPolicyService({
        ...defaults,
        ...options.overrides,
    });
}

export const defaultHrPolicyServiceProvider: { service: HrPolicyServiceContract } = {
    service: getHrPolicyService(),
};
