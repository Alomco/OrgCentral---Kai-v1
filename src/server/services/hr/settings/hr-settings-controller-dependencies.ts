import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import { createHrSettingsRepository } from '@/server/repositories/providers/hr/hr-settings-repository-provider';
import { createAbsenceSettingsRepository } from '@/server/repositories/providers/hr/absence-settings-repository-provider';
import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';

export interface ResolvedHrSettingsControllerDependencies {
    session: GetSessionDependencies;
    hrSettingsRepository: IHRSettingsRepository;
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export type HrSettingsControllerDependencies = Partial<ResolvedHrSettingsControllerDependencies>;

const hrSettingsRepository = createHrSettingsRepository();
const absenceSettingsRepository = createAbsenceSettingsRepository();

export const defaultHrSettingsControllerDependencies: ResolvedHrSettingsControllerDependencies = {
    session: {},
    hrSettingsRepository,
    absenceSettingsRepository,
};

export function resolveHrSettingsControllerDependencies(
    overrides?: HrSettingsControllerDependencies,
): ResolvedHrSettingsControllerDependencies {
    if (!overrides) {
        return defaultHrSettingsControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultHrSettingsControllerDependencies.session,
        hrSettingsRepository:
            overrides.hrSettingsRepository ?? defaultHrSettingsControllerDependencies.hrSettingsRepository,
        absenceSettingsRepository:
            overrides.absenceSettingsRepository ?? defaultHrSettingsControllerDependencies.absenceSettingsRepository,
    };
}
