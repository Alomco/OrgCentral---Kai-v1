import {
    ComplianceTier,
    DataClassificationLevel,
    DataResidencyZone,
    MembershipStatus,
    OrganizationStatus,
    RoleScope,
} from '@/server/types/prisma';
import type { IAbacPolicyRepository } from '@/server/repositories/contracts/org/abac/abac-policy-repository-contract';
import { resolveRoleTemplate } from '@/server/security/role-templates';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import { setAbacPolicies } from '@/server/use-cases/org/abac/set-abac-policies';
import { seedPermissionResources } from '@/server/use-cases/org/permissions/seed-permission-resources';
import { seedDefaultAbsenceTypes } from '@/server/use-cases/hr/absences/seed-default-absence-types';
import { buildAuthorizationContext } from '@/server/use-cases/shared/builders';
import type { createAuth } from '@/server/lib/auth';
import { syncBetterAuthUserToPrisma } from '@/server/lib/auth-sync';
import { AuthorizationError, ValidationError } from '@/server/errors';
import type {
    IPlatformProvisioningRepository,
    PlatformProvisioningConfig,
} from '@/server/repositories/contracts/platform';
import type { JsonRecord } from '@/server/types/json';
import { buildAbacPolicyServiceDependencies } from '@/server/repositories/providers/org/abac-policy-service-dependencies';
import { buildPlatformProvisioningServiceDependencies } from '@/server/repositories/providers/platform/platform-provisioning-service-dependencies';
import { buildPermissionResourceServiceDependencies } from '@/server/repositories/providers/org/permission-resource-service-dependencies';
import { buildAbsenceTypeConfigDependencies } from '@/server/repositories/providers/hr/absence-type-config-service-dependencies';
import {
    BOOTSTRAP_SEED_SOURCE,
    assertUuid,
    constantTimeEquals,
    isBootstrapEnabled,
    requireBootstrapSecret,
    resolvePlatformConfig,
} from './admin-bootstrap.helpers';

export interface AdminBootstrapDependencies {
    provisioningRepository: IPlatformProvisioningRepository;
    abacPolicyRepository: IAbacPolicyRepository;
    auth: ReturnType<typeof createAuth>;
    syncAuthUser?: typeof syncBetterAuthUserToPrisma;
}

export type AdminBootstrapOverrides = {
    auth: AdminBootstrapDependencies['auth'];
} & Partial<Omit<AdminBootstrapDependencies, 'auth'>>;

export interface AdminBootstrapInput {
    token: string;
    requestHeaders: Headers;
}

export interface AdminBootstrapResult {
    orgId: string;
    role: string;
    redirectTo: string;
    setActiveHeaders: Headers;
}

export function buildAdminBootstrapDependencies(
    overrides: AdminBootstrapOverrides,
): AdminBootstrapDependencies {
    const provisioningRepository =
        overrides.provisioningRepository ??
        buildPlatformProvisioningServiceDependencies().provisioningRepository;
    const abacPolicyRepository =
        overrides.abacPolicyRepository ??
        buildAbacPolicyServiceDependencies().abacPolicyRepository;

    return {
        provisioningRepository,
        abacPolicyRepository,
        auth: overrides.auth,
        syncAuthUser: overrides.syncAuthUser,
    };
}

export async function runAdminBootstrap(
    overrides: AdminBootstrapOverrides,
    input: AdminBootstrapInput,
): Promise<AdminBootstrapResult> {
    const deps = buildAdminBootstrapDependencies(overrides);
    if (!isBootstrapEnabled()) {
        throw new AuthorizationError('Admin bootstrap is disabled.');
    }

    const expectedSecret = requireBootstrapSecret();
    if (!constantTimeEquals(input.token, expectedSecret)) {
        throw new AuthorizationError('Invalid bootstrap secret.');
    }

    const session = await deps.auth.api.getSession({ headers: input.requestHeaders });
    if (!session?.session) {
        throw new AuthorizationError('Unauthenticated request.');
    }

    const userEmail = session.user.email;
    if (typeof userEmail !== 'string' || userEmail.trim().length === 0) {
        throw new ValidationError('Authenticated user is missing an email address.');
    }

    const normalizedEmail = userEmail.trim().toLowerCase();
    const userId = await deps.provisioningRepository.ensureAuthUserIdIsUuid(
        session.user.id,
        normalizedEmail,
    );
    assertUuid(userId, 'User id');

    const syncUser = deps.syncAuthUser ?? syncBetterAuthUserToPrisma;
    await syncUser({
        id: userId,
        email: normalizedEmail,
        name: typeof session.user.name === 'string' ? session.user.name : null,
        emailVerified: true,
        lastSignInAt: new Date(),
        updatedAt: new Date(),
    });

    const config = resolvePlatformConfig();
    const superAdminMetadata: JsonRecord = {
        seedSource: BOOTSTRAP_SEED_SOURCE,
        roles: [config.roleName],
        bootstrapProvider: 'oauth',
    };

    const provisioningConfig: PlatformProvisioningConfig = {
        slug: config.platformOrgSlug,
        name: config.platformOrgName,
        regionCode: config.platformRegionCode,
        tenantId: config.platformTenantId,
        status: OrganizationStatus.ACTIVE,
        complianceTier: ComplianceTier.GOV_SECURE,
        dataResidency: DataResidencyZone.UK_ONLY,
        dataClassification: DataClassificationLevel.OFFICIAL,
    };

    const organization = await deps.provisioningRepository.upsertPlatformOrganization(
        provisioningConfig,
    );

    assertUuid(organization.id, 'Organization id');

    const existingPolicies = await deps.abacPolicyRepository.getPoliciesForOrg(organization.id);
    if (existingPolicies.length === 0) {
        const authorization = buildAuthorizationContext({
            orgId: organization.id,
            userId,
            roleKey: config.roleName,
            dataResidency: organization.dataResidency,
            dataClassification: organization.dataClassification,
            auditSource: BOOTSTRAP_SEED_SOURCE,
            tenantScope: {
                orgId: organization.id,
                dataResidency: organization.dataResidency,
                dataClassification: organization.dataClassification,
                auditSource: BOOTSTRAP_SEED_SOURCE,
            },
        });
        await setAbacPolicies(
            { policyRepository: deps.abacPolicyRepository },
            { authorization, policies: DEFAULT_BOOTSTRAP_POLICIES },
        );
    }

    const permissions = resolveRoleTemplate(config.roleName).permissions as Record<string, string[]>;

    const role = await deps.provisioningRepository.upsertPlatformRole({
        orgId: organization.id,
        roleName: config.roleName,
        permissions,
        scope: RoleScope.GLOBAL,
        inheritsRoleIds: [],
        isSystem: true,
        isDefault: true,
        description: 'Platform administrator',
    });

    const timestamp = new Date();

    await deps.provisioningRepository.upsertPlatformMembership({
        orgId: organization.id,
        userId,
        roleId: role.id,
        status: MembershipStatus.ACTIVE,
        metadata: superAdminMetadata,
        timestamps: {
            invitedAt: timestamp,
            activatedAt: timestamp,
            updatedAt: timestamp,
        },
        auditUserId: userId,
    });

    await deps.provisioningRepository.ensurePlatformAuthOrganization(
        provisioningConfig,
        organization,
    );

    const existingMember = await deps.provisioningRepository.findAuthOrgMember(
        organization.id,
        userId,
    );

    if (existingMember) {
        await deps.provisioningRepository.updateAuthOrgMemberRole(existingMember.id, config.roleName);
    } else {
        await deps.provisioningRepository.createAuthOrgMember({
            organizationId: organization.id,
            userId,
            role: config.roleName,
        });
    }

    const { headers: setActiveHeaders } = await deps.auth.api.setActiveOrganization({
        headers: input.requestHeaders,
        body: { organizationId: organization.id },
        returnHeaders: true,
    });

    await seedAdminBootstrapData({
        orgId: organization.id,
        userId,
        roleKey: config.roleName,
        dataResidency: organization.dataResidency,
        dataClassification: organization.dataClassification,
    });

    return {
        orgId: organization.id,
        role: config.roleName,
        redirectTo: '/admin/dashboard',
        setActiveHeaders,
    };
}

interface AdminBootstrapSeedContext {
    orgId: string;
    userId: string;
    roleKey: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

async function seedAdminBootstrapData(context: AdminBootstrapSeedContext): Promise<void> {
    const { permissionRepository } = buildPermissionResourceServiceDependencies();
    await seedPermissionResources({ permissionResourceRepository: permissionRepository }, { orgId: context.orgId });

    const { absenceTypeConfigRepository } = buildAbsenceTypeConfigDependencies();
    const authorization = buildAuthorizationContext({
        orgId: context.orgId,
        userId: context.userId,
        roleKey: context.roleKey,
        dataResidency: context.dataResidency,
        dataClassification: context.dataClassification,
        auditSource: BOOTSTRAP_SEED_SOURCE,
        tenantScope: {
            orgId: context.orgId,
            dataResidency: context.dataResidency,
            dataClassification: context.dataClassification,
            auditSource: BOOTSTRAP_SEED_SOURCE,
        },
    });

    await seedDefaultAbsenceTypes(
        { typeConfigRepository: absenceTypeConfigRepository },
        { authorization, dataResidency: context.dataResidency, dataClassification: context.dataClassification },
    );
}
