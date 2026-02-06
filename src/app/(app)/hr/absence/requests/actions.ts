'use server';

import { headers } from 'next/headers';

import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { invalidateAbsenceScopeCache } from '@/server/use-cases/hr/absences/cache-helpers';
import { HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization';
import { appLogger } from '@/server/logging/structured-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

type AuthorizationAuditContext = Pick<
    RepositoryAuthorizationContext,
    'orgId' | 'dataResidency' | 'dataClassification'
>;

export async function refreshAbsenceRequestsAction(): Promise<void> {
    const headerStore = await headers();
    const correlationId = headerStore.get('x-correlation-id') ?? undefined;
    let auditContext: AuthorizationAuditContext | null = null;

    try {
        const { authorization } = await getSessionContext(
            {},
            {
                headers: headerStore,
                requiredAnyPermissions: [
                    HR_PERMISSION_PROFILE.ABSENCE_LIST,
                    HR_PERMISSION_PROFILE.PROFILE_READ,
                ],
                auditSource: 'ui:hr:absence:requests:refresh',
                correlationId,
                action: HR_ACTION.LIST,
                resourceType: HR_RESOURCE_TYPE.ABSENCE,
                resourceAttributes: {
                    scope: 'requests',
                    correlationId,
                },
            },
        );

        auditContext = {
            orgId: authorization.orgId,
            dataResidency: authorization.dataResidency,
            dataClassification: authorization.dataClassification,
        };

        await invalidateAbsenceScopeCache(authorization);
    } catch (error) {
        appLogger.error('hr.absence.requests.refresh.failed', {
            error: error instanceof Error ? error.message : String(error),
            correlationId,
            orgId: auditContext?.orgId,
            dataResidency: auditContext?.dataResidency,
            dataClassification: auditContext?.dataClassification,
        });
    }
}
