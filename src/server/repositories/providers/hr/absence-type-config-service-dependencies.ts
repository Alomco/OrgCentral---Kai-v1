import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { PrismaAbsenceTypeConfigRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-type-config-repository';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';

export interface AbsenceTypeConfigDependencies {
    absenceTypeConfigRepository: IAbsenceTypeConfigRepository;
}

export interface AbsenceTypeConfigDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: Partial<AbsenceTypeConfigDependencies>;
}

export function buildAbsenceTypeConfigDependencies(
    options?: AbsenceTypeConfigDependencyOptions,
): AbsenceTypeConfigDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    return {
        absenceTypeConfigRepository:
            options?.overrides?.absenceTypeConfigRepository ??
            new PrismaAbsenceTypeConfigRepository(repoOptions),
    };
}
