import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertPrivilegedOrgAbsenceActor } from '@/server/security/authorization';
import type { UpdateAbsenceSettingsPayload } from '@/server/types/hr-absence-schemas';
import type { AbsenceSettings } from '@/server/types/hr-ops-types';
import { toJsonValue } from '@/server/domain/absences/conversions';
import { invalidateAbsenceScopeCache } from './cache-helpers';

export interface UpdateAbsenceSettingsDependencies {
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export interface UpdateAbsenceSettingsInput {
    authorization: RepositoryAuthorizationContext;
    payload: UpdateAbsenceSettingsPayload;
}

export interface UpdateAbsenceSettingsResult {
    settings: AbsenceSettings;
}

export async function updateAbsenceSettings(
    deps: UpdateAbsenceSettingsDependencies,
    input: UpdateAbsenceSettingsInput,
): Promise<UpdateAbsenceSettingsResult> {
    assertPrivilegedOrgAbsenceActor(input.authorization);

    const sanitizedPayload = {
        hoursInWorkDay: input.payload.hoursInWorkDay,
        roundingRule: input.payload.roundingRule?.trim() ?? null,
        metadata: toJsonValue(input.payload.metadata),
    };

    const settings = await deps.absenceSettingsRepository.upsertSettings(
        input.authorization,
        sanitizedPayload,
    );

    await invalidateAbsenceScopeCache(input.authorization);
    return { settings };
}
