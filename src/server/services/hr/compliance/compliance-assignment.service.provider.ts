import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-item-repository';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { ComplianceAssignmentService, type ComplianceAssignmentServiceDependencies } from './compliance-assignment-service';

export interface ComplianceAssignmentServiceProviderOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

function buildDependencies(
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
): ComplianceAssignmentServiceDependencies {
    return {
        complianceItemRepository: new PrismaComplianceItemRepository(prismaOptions),
    };
}

const defaultDependencies = buildDependencies();
const sharedComplianceAssignmentService = new ComplianceAssignmentService(defaultDependencies);

export function getComplianceAssignmentService(
    overrides?: Partial<ComplianceAssignmentServiceDependencies>,
    options?: ComplianceAssignmentServiceProviderOptions,
): ComplianceAssignmentService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedComplianceAssignmentService;
    }

    const deps = buildDependencies(options?.prismaOptions);

    return new ComplianceAssignmentService({
        ...deps,
        ...overrides,
    });
}

export type ComplianceAssignmentServiceContract = Pick<ComplianceAssignmentService, 'assignCompliancePack'>;
