import type { IPlatformProvisioningRepository, PlatformProvisioningConfig } from '@/server/repositories/contracts/platform';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import { resolveRoleTemplate } from '@/server/security/role-templates';
import { updateOrgSettings } from '@/server/services/org/settings/org-settings-store';
import { loadOrgSettings } from '@/server/services/org/settings/org-settings-store';
import type { OrgRoleKey } from '@/server/security/access-control';
import { MembershipStatus, RoleScope } from '@/server/types/prisma';
import type { JsonRecord } from '@/server/types/json';
import { setAbacPolicies } from '@/server/use-cases/org/abac/set-abac-policies';
import { buildAuthorizationContext } from '@/server/use-cases/shared/builders';
import { assertUuid } from './admin-bootstrap.helpers';
import type { AdminBootstrapDependencies } from './admin-bootstrap.dependencies';

type PlatformOrganization = Awaited<ReturnType<IPlatformProvisioningRepository['upsertPlatformOrganization']>>;

interface ProvisionBootstrapOrganizationInput {
    deps: AdminBootstrapDependencies;
    provisioningConfig: PlatformProvisioningConfig;
    roleName: OrgRoleKey;
    userId: string;
    seedSource: string;
    superAdminMetadata: JsonRecord;
}

interface ProvisionBootstrapOrganizationResult {
    organization: PlatformOrganization;
}

export async function provisionBootstrapOrganization(
    input: ProvisionBootstrapOrganizationInput,
): Promise<ProvisionBootstrapOrganizationResult> {
    const organization = await input.deps.provisioningRepository.upsertPlatformOrganization(
        input.provisioningConfig,
    );

    assertUuid(organization.id, 'Organization id');

    const permissions = resolveRoleTemplate(input.roleName).permissions as Record<string, string[]>;
    const role = await input.deps.provisioningRepository.upsertPlatformRole({
        orgId: organization.id,
        roleName: input.roleName,
        permissions,
        scope: RoleScope.GLOBAL,
        inheritsRoleIds: [],
        isSystem: true,
        isDefault: true,
        description: 'Platform administrator',
    });

    const timestamp = new Date();
    await input.deps.provisioningRepository.upsertPlatformMembership({
        orgId: organization.id,
        userId: input.userId,
        roleId: role.id,
        status: MembershipStatus.ACTIVE,
        metadata: input.superAdminMetadata,
        timestamps: {
            invitedAt: timestamp,
            activatedAt: timestamp,
            updatedAt: timestamp,
        },
        auditUserId: input.userId,
    });

    const currentSettings = await loadOrgSettings(organization.id);
    await updateOrgSettings(
        buildAuthorizationContext({
            orgId: organization.id,
            userId: input.userId,
            roleKey: input.roleName,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
            auditSource: input.seedSource,
            tenantScope: {
                orgId: organization.id,
                dataResidency: organization.dataResidency,
                dataClassification: organization.dataClassification,
                auditSource: input.seedSource,
            },
        }),
        {
            security: {
                ...currentSettings.security,
                mfaRequired: true,
            },
        },
    );

    const existingPolicies = await input.deps.abacPolicyRepository.getPoliciesForOrg(organization.id);
    if (existingPolicies.length === 0) {
        const authorization = buildAuthorizationContext({
            orgId: organization.id,
            userId: input.userId,
            roleKey: input.roleName,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
            auditSource: input.seedSource,
            tenantScope: {
                orgId: organization.id,
                dataResidency: organization.dataResidency,
                dataClassification: organization.dataClassification,
                auditSource: input.seedSource,
            },
        });
        await setAbacPolicies(
            { policyRepository: input.deps.abacPolicyRepository },
            { authorization, policies: DEFAULT_BOOTSTRAP_POLICIES },
        );
    }

    await input.deps.provisioningRepository.ensurePlatformAuthOrganization(
        input.provisioningConfig,
        organization,
    );

    const existingMember = await input.deps.provisioningRepository.findAuthOrgMember(
        organization.id,
        input.userId,
    );

    if (existingMember) {
        await input.deps.provisioningRepository.updateAuthOrgMemberRole(
            existingMember.id,
            input.roleName,
        );
    } else {
        await input.deps.provisioningRepository.createAuthOrgMember({
            organizationId: organization.id,
            userId: input.userId,
            role: input.roleName,
        });
    }

    return { organization };
}
