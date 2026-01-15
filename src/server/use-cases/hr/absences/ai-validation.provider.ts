import { buildAbsenceServiceDependencies } from '@/server/repositories/providers/hr/absence-service-dependencies';
import type { AbsenceAiValidationServiceDeps } from '@/server/use-cases/hr/absences/ai-validation.types';

export function buildAbsenceAiValidationDependencies(
    overrides: Partial<AbsenceAiValidationServiceDeps> = {},
): AbsenceAiValidationServiceDeps {
    const { absenceRepository, typeConfigRepository, attachmentDownloader, aiValidator } =
        buildAbsenceServiceDependencies({
            overrides: {
                absenceRepository: overrides.absenceRepository,
                typeConfigRepository: overrides.typeConfigRepository,
                attachmentDownloader: overrides.attachmentDownloader,
                aiValidator: overrides.aiValidator,
            },
        });

    return {
        absenceRepository,
        typeConfigRepository,
        attachmentDownloader,
        aiValidator,
        auditLogger: overrides.auditLogger,
        now: overrides.now,
    };
}
