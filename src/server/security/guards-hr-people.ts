import { requireAbacAllowance } from './authorization/abac-context';
import { authorizeOrgAccessRbacOnly } from './authorization/engine';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import {
    createHrPeopleAuthorizationDefaults,
} from '@/server/use-cases/hr/people/shared/repository-authorizer-helpers';
import { HR_ACTION, HR_RESOURCE } from './authorization/hr-resource-registry';
import type { OrgPermissionMap } from './access-control';

interface PeopleGuardRequest {
    authorization: RepositoryAuthorizationContext;
    resourceAttributes?: Record<string, unknown>;
    action?: string;
}

const BASE_DEFAULTS = createHrPeopleAuthorizationDefaults();

async function assertPeopleAccess(
    authorization: RepositoryAuthorizationContext,
    params: {
        action: string;
        resourceType: string;
        resourceAttributes?: Record<string, unknown>;
        requiredPermissions?: OrgPermissionMap;
    },
): Promise<RepositoryAuthorizationContext> {
    authorizeOrgAccessRbacOnly(
        {
            orgId: authorization.orgId,
            userId: authorization.userId,
            requiredPermissions: params.requiredPermissions ?? BASE_DEFAULTS.requiredPermissions,
            expectedResidency: BASE_DEFAULTS.expectedResidency,
            expectedClassification: BASE_DEFAULTS.expectedClassification,
        },
        authorization,
    );

    await requireAbacAllowance({
        orgId: authorization.orgId,
        userId: authorization.userId,
        action: params.action,
        resourceType: params.resourceType,
        roles: [authorization.roleKey],
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
        action: request.action ?? HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: { employeeProfile: ['read'] },
    });
}

export function assertPeopleProfileEditor(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_EMPLOYEE_PROFILE,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: { employeeProfile: ['update'] },
    });
}

export function assertEmploymentContractReader(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? HR_ACTION.READ,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: { employmentContract: ['read'] },
    });
}

export function assertEmploymentContractEditor(
    request: PeopleGuardRequest,
): Promise<RepositoryAuthorizationContext> {
    return assertPeopleAccess(request.authorization, {
        action: request.action ?? HR_ACTION.UPDATE,
        resourceType: HR_RESOURCE.HR_EMPLOYMENT_CONTRACT,
        resourceAttributes: request.resourceAttributes,
        requiredPermissions: { employmentContract: ['update'] },
    });
}
