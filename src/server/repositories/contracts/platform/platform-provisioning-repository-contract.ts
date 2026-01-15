import type {
    ComplianceTier,
    DataClassificationLevel,
    DataResidencyZone,
    MembershipStatus,
    OrganizationStatus,
    RoleScope,
} from '@/server/types/prisma';
import type { JsonRecord } from '@/server/types/json';

export interface PlatformProvisioningConfig {
    slug: string;
    name: string;
    regionCode: string;
    tenantId: string;
    status: OrganizationStatus;
    complianceTier: ComplianceTier;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

export interface PlatformOrganizationRecord {
    id: string;
    slug: string;
    name: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

export interface PlatformRoleUpsertInput {
    orgId: string;
    roleName: string;
    permissions: Record<string, unknown>;
    scope?: RoleScope;
    inheritsRoleIds?: string[];
    description?: string | null;
    isSystem?: boolean;
    isDefault?: boolean;
}

export interface PlatformRoleRecord {
    id: string;
    name: string;
    scope: RoleScope;
}

export interface PlatformMembershipUpsertInput {
    orgId: string;
    userId: string;
    roleId: string;
    status: MembershipStatus;
    metadata: JsonRecord;
    timestamps: {
        invitedAt: Date | null;
        activatedAt: Date;
        updatedAt: Date;
    };
    auditUserId: string;
}

export interface PlatformAuthOrgMemberRecord {
    id: string;
    organizationId: string;
    userId: string;
    role: string;
}

export interface IPlatformProvisioningRepository {
    ensureAuthUserIdIsUuid(authUserId: string, email: string): Promise<string>;

    upsertPlatformOrganization(input: PlatformProvisioningConfig): Promise<PlatformOrganizationRecord>;

    upsertPlatformRole(input: PlatformRoleUpsertInput): Promise<PlatformRoleRecord>;

    upsertPlatformMembership(input: PlatformMembershipUpsertInput): Promise<void>;

    ensurePlatformAuthOrganization(
        input: PlatformProvisioningConfig,
        organization: PlatformOrganizationRecord,
    ): Promise<void>;

    findAuthOrgMember(orgId: string, userId: string): Promise<PlatformAuthOrgMemberRecord | null>;

    updateAuthOrgMemberRole(id: string, role: string): Promise<void>;

    createAuthOrgMember(input: { organizationId: string; userId: string; role: string }): Promise<void>;

    listUserOrganizations(userId: string, limit?: number): Promise<PlatformOrganizationRecord[]>;
}
