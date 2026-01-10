'use server';

import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';

const NOT_AUTHORIZED_TO_MANAGE_LEAVE_POLICIES_MESSAGE = 'Not authorized to manage leave policies.';
const HR_SETTINGS_PATH = '/hr/settings';

type LeavePolicyAction = 'create' | 'update' | 'delete';

export async function getLeavePolicySession(action: LeavePolicyAction) {
    try {
        const headerStore = await headers();
        return await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredPermissions: { organization: ['update'] },
                auditSource: `ui:hr:leave-policies:${action}`,
            },
        );
    } catch {
        return null;
    }
}

export { HR_SETTINGS_PATH, NOT_AUTHORIZED_TO_MANAGE_LEAVE_POLICIES_MESSAGE };
