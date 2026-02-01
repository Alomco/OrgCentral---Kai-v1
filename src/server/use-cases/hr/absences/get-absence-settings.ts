import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';

export interface GetAbsenceSettingsInput {
    authorization: RepositoryAuthorizationContext;
}

export interface GetAbsenceSettingsDependencies {
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export interface GetAbsenceSettingsResult {
    settings: AbsenceSettings;
}

const DEFAULT_HOURS_PER_DAY = 8;

function buildDefaultAbsenceSettings(orgId: string): AbsenceSettings {
    const now = new Date();
    return {
        orgId,
        hoursInWorkDay: DEFAULT_HOURS_PER_DAY,
        roundingRule: null,
        metadata: null,
        createdAt: now,
        updatedAt: now,
    };
}

export async function getAbsenceSettings(
    deps: GetAbsenceSettingsDependencies,
    input: GetAbsenceSettingsInput,
): Promise<GetAbsenceSettingsResult> {
    const existing = await deps.absenceSettingsRepository.getSettings(input.authorization);
    if (existing) {
        return { settings: existing };
    }

    return { settings: buildDefaultAbsenceSettings(input.authorization.orgId) };
}
