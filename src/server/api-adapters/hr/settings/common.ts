import type { IHRSettingsRepository } from '@/server/repositories/contracts/hr/settings/hr-settings-repository-contract';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import { PrismaHRSettingsRepository } from '@/server/repositories/prisma/hr/settings';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-settings-repository';
import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';

export interface ResolvedHrSettingsControllerDependencies {
    session: GetSessionDependencies;
    hrSettingsRepository: IHRSettingsRepository;
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export type HrSettingsControllerDependencies = Partial<ResolvedHrSettingsControllerDependencies>;

const hrSettingsRepository = new PrismaHRSettingsRepository();
const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();

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
