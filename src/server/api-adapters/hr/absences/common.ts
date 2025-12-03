import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-settings-repository';
import { PrismaAbsenceTypeConfigRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-type-config-repository';
import { PrismaUnplannedAbsenceRepository } from '@/server/repositories/prisma/hr/absences/prisma-unplanned-absence-repository';
import { PrismaLeaveBalanceRepository } from '@/server/repositories/prisma/hr/leave/prisma-leave-balance-repository';
import { PrismaEmployeeProfileRepository } from '@/server/repositories/prisma/hr/people';
import { HttpAttachmentDownloader } from '@/server/lib/storage/http-attachment-downloader';
import { GeminiAbsenceDocumentValidator } from '@/server/lib/ai/gemini-document-validator';
import { AbsenceService, type AbsenceServiceDependencies } from '@/server/services/hr/absences/absence-service';
import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';

type AbsenceServiceContract = Pick<
    AbsenceService,
    | 'listAbsences'
    | 'reportAbsence'
    | 'approveAbsence'
    | 'updateAbsence'
    | 'addAttachments'
    | 'removeAttachment'
    | 'recordReturnToWork'
    | 'deleteAbsence'
    | 'acknowledgeAbsence'
    | 'cancelAbsence'
    | 'updateSettings'
    | 'analyzeAttachment'
>;

export interface ResolvedAbsenceControllerDependencies {
    session: GetSessionDependencies;
    service: AbsenceServiceContract;
}

export type AbsenceControllerDependencies = Partial<ResolvedAbsenceControllerDependencies>;

const absenceRepository = new PrismaUnplannedAbsenceRepository();
const typeConfigRepository = new PrismaAbsenceTypeConfigRepository();
const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();
const leaveBalanceRepository = new PrismaLeaveBalanceRepository();
const attachmentDownloader = new HttpAttachmentDownloader();
const aiValidator = new GeminiAbsenceDocumentValidator();

const absenceServiceDependencies: AbsenceServiceDependencies = {
    absenceRepository,
    typeConfigRepository,
    absenceSettingsRepository,
    leaveBalanceRepository,
    attachmentDownloader,
    aiValidator,
    employeeProfileRepository: new PrismaEmployeeProfileRepository(),
};

const sharedAbsenceService = new AbsenceService(absenceServiceDependencies);

export const defaultAbsenceControllerDependencies: ResolvedAbsenceControllerDependencies = {
    session: {},
    service: sharedAbsenceService,
};

export function resolveAbsenceControllerDependencies(
    overrides?: AbsenceControllerDependencies,
): ResolvedAbsenceControllerDependencies {
    if (!overrides) {
        return defaultAbsenceControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultAbsenceControllerDependencies.session,
        service: overrides.service ?? defaultAbsenceControllerDependencies.service,
    };
}

