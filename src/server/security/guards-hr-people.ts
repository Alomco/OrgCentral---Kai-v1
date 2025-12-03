import { requireAbacAllowance } from './authorization/abac-context';
import { assertRbac } from './authorization/rbac';
import type { OrgRoleKey } from './access-control';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    createHrPeopleAuthorizationDefaults,
    createHrPeopleContractRepositoryDefaults,
    createHrPeopleEditorRepositoryDefaults,
    createHrPeopleProfileRepositoryDefaults,
} from '@/server/use-cases/hr/people/shared/repository-authorizer-helpers';

interface PeopleGuardRequest {
    authorization: RepositoryAuthorizationContext;
    resourceAttributes?: Record<string, unknown>;
    action?: string;
}

const BASE_DEFAULTS = createHrPeopleAuthorizationDefaults();
const PROFILE_DEFAULTS = createHrPeopleProfileRepositoryDefaults();
const PROFILE_EDITOR_DEFAULTS = createHrPeopleEditorRepositoryDefaults();
const CONTRACT_DEFAULTS = createHrPeopleContractRepositoryDefaults();

function resolveRoleKey(context: RepositoryAuthorizationContext): OrgRoleKey | undefined {
    return context.roleKey === 'custom' ? undefined : context.roleKey;
}

function assertRoleRequirement(
    authorization: RepositoryAuthorizationContext,
    requiredRoles?: readonly OrgRoleKey[],
): void {
    if (!requiredRoles?.length) {
        return;
    }

    const roleKey = resolveRoleKey(authorization);
    if (!roleKey) {
        throw new Error('Custom roles are not permitted for this HR people operation.');
    }

    assertRbac(roleKey, { requiredRoles: [...requiredRoles] });
}

async function assertPeopleAccess(
    authorization: RepositoryAuthorizationContext,
    params: {
        action: string;
        resourceType: string;
        resourceAttributes?: Record<string, unknown>;
        requiredRoles?: readonly OrgRoleKey[];
    },
): Promise<RepositoryAuthorizationContext> {
    assertRoleRequirement(authorization, params.requiredRoles ?? BASE_DEFAULTS.requiredRoles);

    const resolvedRole = resolveRoleKey(authorization);

    await requireAbacAllowance({
        orgId: authorization.orgId,
        userId: authorization.userId,
        action: params.action,
        resourceType: params.resourceType,
        roles: resolvedRole ? [resolvedRole] : undefined,
        guardContext: authorization,
        resourceAttributes: {
            ...params.resourceAttributes,
            residency: authorization.dataResidency,
            classification: authorization.dataClassification,
            expectedResidency: BASE_DEFAULTS.expectedResidency,
            expectedClassification: BASE_DEFAULTS.expectedClassification,
        },
    });

    return authorization;
}

export function assertPeopleProfileReader(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? 'read',
        resourceType: 'employeeProfile',
        resourceAttributes: request.resourceAttributes,
        requiredRoles: PROFILE_DEFAULTS.requiredRoles ?? BASE_DEFAULTS.requiredRoles,
    });
}

export function assertPeopleProfileEditor(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? 'update',
        resourceType: 'employeeProfile',
        resourceAttributes: request.resourceAttributes,
        requiredRoles: PROFILE_EDITOR_DEFAULTS.requiredRoles,
    });
}

export function assertEmploymentContractReader(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? 'read',
        resourceType: 'employmentContract',
        resourceAttributes: request.resourceAttributes,
        requiredRoles: CONTRACT_DEFAULTS.requiredRoles ?? BASE_DEFAULTS.requiredRoles,
    });
}

export function assertEmploymentContractEditor(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? 'update',
        resourceType: 'employmentContract',
        resourceAttributes: request.resourceAttributes,
        requiredRoles: PROFILE_EDITOR_DEFAULTS.requiredRoles,
    });
}
