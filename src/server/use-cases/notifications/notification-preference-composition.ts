import { buildNotificationPreferenceServiceDependencies } from '@/server/repositories/providers/org/notification-preference-service-dependencies';
import type { GetNotificationPreferencesInput, GetNotificationPreferencesResult } from './get-preference';
import { getNotificationPreferences } from './get-preference';

export function getNotificationPreferencesWithPrisma(
    input: GetNotificationPreferencesInput,
): Promise<GetNotificationPreferencesResult> {
    const repository =
        buildNotificationPreferenceServiceDependencies().preferenceRepository;
    return getNotificationPreferences({ preferenceRepository: repository }, input);
}
