import { buildNotificationPreferenceServiceDependencies } from '@/server/repositories/providers/org/notification-preference-service-dependencies';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { NotificationPreference } from '@/server/types/hr-types';
import { updateNotificationPreference as updateNotificationPreferenceUseCase } from '@/server/use-cases/notifications/update-preference';

export async function updateNotificationPreference(
    authorization: RepositoryAuthorizationContext,
    preferenceId: string,
    updates: Partial<Pick<NotificationPreference, 'channel' | 'enabled' | 'quietHours' | 'metadata'>>,
) {
    const { preferenceRepository } = buildNotificationPreferenceServiceDependencies();
    return updateNotificationPreferenceUseCase(
        { preferenceRepository },
        { authorization, preferenceId, updates },
    );
}
