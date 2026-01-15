import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import { DEFAULT_WORKING_HOURS_PER_DAY } from './leave-calculator';

export async function resolveHoursPerDay(
    absenceSettingsRepository: IAbsenceSettingsRepository,
    authorization: RepositoryAuthorizationContext,
): Promise<number> {
    const settings = await absenceSettingsRepository.getSettings(authorization);
    if (settings?.hoursInWorkDay) {
        const parsed = typeof settings.hoursInWorkDay === 'number'
            ? settings.hoursInWorkDay
            : Number(settings.hoursInWorkDay);
        if (!Number.isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return DEFAULT_WORKING_HOURS_PER_DAY;
}
