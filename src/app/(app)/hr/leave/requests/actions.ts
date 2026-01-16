'use server';

import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { invalidateOrgCache } from '@/server/lib/cache-tags';
import { CACHE_SCOPE_LEAVE_REQUESTS } from '@/server/repositories/cache-scopes';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
import { appLogger } from '@/server/logging/structured-logger';

export async function refreshLeaveRequestsAction(): Promise<void> {
    const headerStore = await headers();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;

    try {
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredAnyPermissions: [
                    { [HR_RESOURCE.HR_LEAVE]: ['read'] },
                    { employeeProfile: ['read'] },
                ],
                auditSource: 'ui:hr:leave:requests:refresh',
                correlationId,
                action: HR_ACTION.READ,
                resourceType: HR_RESOURCE.HR_LEAVE,
                resourceAttributes: {
                    scope: 'requests',
                    correlationId,
                },
            },
        );

        await invalidateOrgCache(
            authorization.orgId,
            CACHE_SCOPE_LEAVE_REQUESTS,
            authorization.dataClassification,
            authorization.dataResidency,
        );

    } catch (error) {
        appLogger.error('hr.leave.requests.refresh.failed', {
            error: error instanceof Error ? error.message : String(error),
            correlationId,
        });
    }
}
