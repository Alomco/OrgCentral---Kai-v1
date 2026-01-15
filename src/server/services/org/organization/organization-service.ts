import { buildOrganizationServiceDependencies } from '@/server/repositories/providers/org/organization-service-dependencies';
import { buildRoleServiceDependencies } from '@/server/repositories/providers/org/role-service-dependencies';
import { buildMembershipRepositoryDependencies } from '@/server/repositories/providers/org/membership-service-dependencies';
import { buildAbacPolicyServiceDependencies } from '@/server/repositories/providers/org/abac-policy-service-dependencies';
import { buildPermissionResourceServiceDependencies } from '@/server/repositories/providers/org/permission-resource-service-dependencies';
import { buildAbsenceTypeConfigDependencies } from '@/server/repositories/providers/hr/absence-type-config-service-dependencies';
import { getOrganization as getOrganizationUseCase } from '@/server/use-cases/org/organization/get-organization';
import { updateOrganizationProfile as updateOrganizationProfileUseCase } from '@/server/use-cases/org/organization/update-profile';
import { createOrganizationWithOwner as createOrganizationWithOwnerUseCase } from '@/server/use-cases/org/organization/create-organization-with-owner';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { OrganizationCreateInput } from '@/server/validators/org/organization-create';

export async function fetchOrganization(
    authorization: RepositoryAuthorizationContext,
    orgId: string,
) {
    const { organizationRepository } = buildOrganizationServiceDependencies();
    return getOrganizationUseCase({ organizationRepository }, { authorization, orgId });
}

export async function updateOrganizationProfile(
    authorization: RepositoryAuthorizationContext,
    orgId: string,
    updates: Record<string, unknown>,
) {
    const { organizationRepository } = buildOrganizationServiceDependencies();
    return updateOrganizationProfileUseCase({ organizationRepository }, { authorization, orgId, updates });
}

export async function createOrganizationWithOwner(
    authorization: RepositoryAuthorizationContext,
    payload: {
        actor: { userId: string; email: string; displayName?: string };
        organization: OrganizationCreateInput & { tenantId: string };
    },
) {
    const { organizationRepository } = buildOrganizationServiceDependencies();
    const { roleRepository } = buildRoleServiceDependencies();
    const { membershipRepository } = buildMembershipRepositoryDependencies();
    const { abacPolicyRepository } = buildAbacPolicyServiceDependencies();
    const { permissionRepository: permissionResourceRepository } = buildPermissionResourceServiceDependencies();
    const { absenceTypeConfigRepository } = buildAbsenceTypeConfigDependencies();

    return createOrganizationWithOwnerUseCase(
        {
            organizationRepository,
            roleRepository,
            membershipRepository,
            abacPolicyRepository,
            permissionResourceRepository,
            absenceTypeConfigRepository,
        },
        {
            authorization,
            actor: payload.actor,
            organization: payload.organization,
        },
    );
}
