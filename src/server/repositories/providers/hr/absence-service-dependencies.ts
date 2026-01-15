import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import {
    PrismaAbsenceSettingsRepository,
    PrismaAbsenceTypeConfigRepository,
    PrismaUnplannedAbsenceRepository,
} from '@/server/repositories/prisma/hr/absences';
import { PrismaLeaveBalanceRepository } from '@/server/repositories/prisma/hr/leave';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { HttpAttachmentDownloader } from '@/server/lib/storage/http-attachment-downloader';
import { GeminiAbsenceDocumentValidator } from '@/server/lib/ai/gemini-document-validator';
import type { BasePrismaRepositoryOptions } from '@/server/repositories/prisma/base-prisma-repository';
import type { OrgScopedRepositoryOptions } from '@/server/repositories/prisma/org/org-scoped-prisma-repository';
import type { AbsenceAttachmentDownloader, AbsenceDocumentAiValidator } from '@/server/types/absence-ai';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { IAbsenceTypeConfigRepository } from '@/server/repositories/contracts/hr/absences/absence-type-config-repository-contract';
import type { IUnplannedAbsenceRepository } from '@/server/repositories/contracts/hr/absences/unplanned-absence-repository-contract';
import type { ILeaveBalanceRepository } from '@/server/repositories/contracts/hr/leave/leave-balance-repository-contract';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';

export interface AbsenceRepositoryDependencies {
    absenceRepository: IUnplannedAbsenceRepository;
    typeConfigRepository: IAbsenceTypeConfigRepository;
    absenceSettingsRepository: IAbsenceSettingsRepository;
    leaveBalanceRepository: ILeaveBalanceRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    attachmentDownloader: AbsenceAttachmentDownloader;
    aiValidator: AbsenceDocumentAiValidator;
}

export interface AbsenceServiceDependencyOptions {
    prismaOptions?: Pick<BasePrismaRepositoryOptions, 'prisma' | 'trace' | 'onAfterWrite'>;
    overrides?: Partial<AbsenceRepositoryDependencies>;
}

export function buildAbsenceServiceDependencies(
    options?: AbsenceServiceDependencyOptions,
): AbsenceRepositoryDependencies {
    const prisma = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions: OrgScopedRepositoryOptions = {
        prisma,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    };

    const attachmentDownloader: AbsenceAttachmentDownloader =
        options?.overrides?.attachmentDownloader ?? new HttpAttachmentDownloader();

    const aiValidator: AbsenceDocumentAiValidator =
        options?.overrides?.aiValidator ?? new GeminiAbsenceDocumentValidator();

    return {
        absenceRepository:
            options?.overrides?.absenceRepository ?? new PrismaUnplannedAbsenceRepository(repoOptions),
        typeConfigRepository:
            options?.overrides?.typeConfigRepository ?? new PrismaAbsenceTypeConfigRepository(repoOptions),
        absenceSettingsRepository:
            options?.overrides?.absenceSettingsRepository ?? new PrismaAbsenceSettingsRepository(repoOptions),
        leaveBalanceRepository:
            options?.overrides?.leaveBalanceRepository ?? new PrismaLeaveBalanceRepository(repoOptions),
        employeeProfileRepository:
            options?.overrides?.employeeProfileRepository ?? new PrismaEmployeeProfileRepository(repoOptions),
        attachmentDownloader,
        aiValidator,
    };
}
