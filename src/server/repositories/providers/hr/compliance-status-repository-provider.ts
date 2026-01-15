import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaComplianceStatusRepository } from '@/server/repositories/prisma/hr/compliance';
import type { IComplianceStatusRepository } from '@/server/repositories/contracts/hr/compliance/compliance-status-repository-contract';

export interface ComplianceStatusRepositoryProviderOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<{ complianceStatusRepository: IComplianceStatusRepository }>;
}

export function createComplianceStatusRepository(
    options?: ComplianceStatusRepositoryProviderOptions,
): IComplianceStatusRepository {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return (
        options?.overrides?.complianceStatusRepository ??
        new PrismaComplianceStatusRepository(repoOptions)
    );
}
