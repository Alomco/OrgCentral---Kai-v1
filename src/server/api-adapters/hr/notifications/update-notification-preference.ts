import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { NotificationPreference } from '@/server/types/hr-types';
import { updateNotificationPreference } from '@/server/services/hr/notifications/notification-preference-service';

export interface UpdateNotificationPreferenceActionInput {
    authorization: RepositoryAuthorizationContext;
    preferenceId: string;
    updates: Partial<Pick<NotificationPreference, 'channel' | 'enabled' | 'quietHours' | 'metadata'>>;
}

export interface UpdateNotificationPreferenceActionResult {
    preference: NotificationPreference | null;
}

// API adapter: update a notification preference.
export async function updateNotificationPreferenceAction(
    input: UpdateNotificationPreferenceActionInput,
): Promise<UpdateNotificationPreferenceActionResult> {
    const result = await updateNotificationPreference(
        input.authorization,
        input.preferenceId,
        input.updates,
    );

    return result;
}
