import type { AuthActionOptions } from '@/server/actions/auth-action';
import type { OrgPermissionMap } from '@/server/security/access-control';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';
import type {
    GetSessionDependencies,
    GetSessionInput,
    GetSessionResult,
} from '@/server/use-cases/auth/sessions/get-session';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import {
    getSessionContextOrRedirect,
    type SessionRedirectOptions,
} from '@/server/ui/auth/session-redirect';

export interface HrAccessBaseInput {
    readonly requiredPermissions?: OrgPermissionMap;
    readonly requiredAnyPermissions?: readonly OrgPermissionMap[];
    readonly expectedClassification?: DataClassificationLevel;
    readonly expectedResidency?: DataResidencyZone;
    readonly auditSource: string;
    readonly correlationId?: string;
    readonly action: string;
    readonly resourceType: string;
    readonly resourceAttributes?: Record<string, unknown>;
    readonly orgId?: string;
}

export interface HrSessionAccessInput extends HrAccessBaseInput {
    readonly headers: Headers | HeadersInit;
}

export async function getHrSessionContextOrRedirect(
    deps: GetSessionDependencies,
    access: HrSessionAccessInput,
    options?: SessionRedirectOptions,
): Promise<GetSessionResult> {
    return getSessionContextOrRedirect(deps, access satisfies GetSessionInput, options);
}

export async function getOptionalHrAuthorization(
    deps: GetSessionDependencies,
    access: HrSessionAccessInput,
): Promise<RepositoryAuthorizationContext | null> {
    try {
        const { authorization } = await getSessionContext(deps, access satisfies GetSessionInput);
        return authorization;
    } catch {
        return null;
    }
}

export function buildHrAuthActionOptions(access: HrAccessBaseInput): AuthActionOptions {
    return {
        requiredPermissions: access.requiredPermissions,
        requiredAnyPermissions: access.requiredAnyPermissions,
        expectedClassification: access.expectedClassification,
        expectedResidency: access.expectedResidency,
        auditSource: access.auditSource,
        correlationId: access.correlationId,
        action: access.action,
        resourceType: access.resourceType,
        resourceAttributes: access.resourceAttributes,
    } satisfies AuthActionOptions;
}
