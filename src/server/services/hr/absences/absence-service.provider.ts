import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import {
    PrismaAbsenceSettingsRepository,
    PrismaAbsenceTypeConfigRepository,
    PrismaUnplannedAbsenceRepository,
} from '@/server/repositories/prisma/hr/absences';
import { PrismaLeaveBalanceRepository } from '@/server/repositories/prisma/hr/leave';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import { AbsenceService, type AbsenceServiceDependencies } from './absence-service';
import type { AbsenceAttachmentDownloader, AbsenceDocumentAiValidator } from '@/server/types/absence-ai';
import { Buffer } from 'node:buffer';

export interface AbsenceServiceProviderOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
}

function buildDependencies(
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>,
): AbsenceServiceDependencies {
    const prisma = prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma,
        trace: prismaOptions?.trace,
        onAfterWrite: prismaOptions?.onAfterWrite,
    };

    const attachmentDownloader: AbsenceAttachmentDownloader = {
        async download(request) {
            return {
                buffer: Buffer.from([]),
                contentType: request.attachment.contentType ?? 'application/octet-stream',
                fileName: request.attachment.fileName ?? 'attachment',
            };
        },
    };

    const aiValidator: AbsenceDocumentAiValidator = {
        async analyze() {
            return {
                status: 'ERROR',
                summary: 'AI validation is not configured.',
                issues: [],
            };
        },
    };

    return {
        absenceRepository: new PrismaUnplannedAbsenceRepository(repoOptions),
        typeConfigRepository: new PrismaAbsenceTypeConfigRepository(repoOptions),
        absenceSettingsRepository: new PrismaAbsenceSettingsRepository(repoOptions),
        employeeProfileRepository: new PrismaEmployeeProfileRepository(repoOptions),
        leaveBalanceRepository: new PrismaLeaveBalanceRepository(repoOptions),
        attachmentDownloader,
        aiValidator,
    };
}

const defaultDependencies = buildDependencies();
const sharedAbsenceService = new AbsenceService(defaultDependencies);

export function getAbsenceService(
    overrides?: Partial<AbsenceServiceDependencies>,
    options?: AbsenceServiceProviderOptions,
): AbsenceService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedAbsenceService;
    }

    const deps = buildDependencies(options?.prismaOptions);

    return new AbsenceService({
        ...deps,
        ...overrides,
    });
}

export type AbsenceServiceContract = Pick<AbsenceService, 'listAbsences' | 'cancelAbsence'>;
