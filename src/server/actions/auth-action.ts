import { headers as nextHeaders } from 'next/headers';

import { getSessionContext, type GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrgPermissionMap } from '@/server/security/access-control';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface AuthActionOptions {
    sessionDependencies?: GetSessionDependencies;
    requiredPermissions?: OrgPermissionMap;
    requiredAnyPermissions?: readonly OrgPermissionMap[];
    expectedClassification?: DataClassificationLevel;
    expectedResidency?: DataResidencyZone;
    auditSource: string;
    correlationId?: string;
    action?: string;
    resourceType?: string;
    resourceAttributes?: Record<string, unknown>;
}

export interface AuthActionContext {
    authorization: RepositoryAuthorizationContext;
    headers: Headers;
}

export async function authAction<TResult>(
    options: AuthActionOptions,
    handler: (context: AuthActionContext) => Promise<TResult>,
): Promise<TResult> {
    const headerStore = await nextHeaders();

    const { authorization } = await getSessionContext(options.sessionDependencies ?? {}, {
        headers: headerStore,
        requiredPermissions: options.requiredPermissions,
        requiredAnyPermissions: options.requiredAnyPermissions,
        expectedClassification: options.expectedClassification,
        expectedResidency: options.expectedResidency,
        auditSource: options.auditSource,
        correlationId: options.correlationId,
        action: options.action,
        resourceType: options.resourceType,
        resourceAttributes: options.resourceAttributes,
    });

    return handler({ authorization, headers: headerStore });
}
