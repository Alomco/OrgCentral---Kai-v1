import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import {
  ComplianceTier,
  DataClassificationLevel,
  DataResidencyZone,
  MembershipStatus,
  OrganizationStatus,
  RoleScope,
} from '@prisma/client';
import { prisma } from '@/server/lib/prisma';

type Json = Prisma.InputJsonValue;

const OWNER_ROLE_PERMISSIONS: Record<string, string[]> = {
  organization: ['create', 'read', 'update', 'delete', 'governance'],
  member: ['read', 'invite', 'update', 'remove'],
  invitation: ['create', 'cancel'],
  audit: ['read', 'write'],
  cache: ['tag', 'invalidate'],
  residency: ['enforce'],
};

export interface ColdStartConfig {
  platformOrgSlug?: string;
  platformOrgName?: string;
  platformTenantId?: string;
  platformRegionCode?: string;
  globalAdminEmail?: string;
  globalAdminName?: string;
  developmentAdminEmail?: string;
  developmentAdminName?: string;
  roleName?: string;
}

export interface ColdStartResult {
  organizationId: string;
  roleId: string;
  globalAdminUserId: string;
  developmentAdminUserId: string;
}

export async function runColdStart(config: ColdStartConfig = {}): Promise<ColdStartResult> {
  const settings = resolveConfig(config);

  const organization = await prisma.organization.upsert({
    where: { slug: settings.platformOrgSlug },
    update: {
      name: settings.platformOrgName,
      regionCode: settings.platformRegionCode,
      tenantId: settings.platformTenantId,
      status: OrganizationStatus.ACTIVE,
      complianceTier: ComplianceTier.GOV_SECURE,
      dataResidency: DataResidencyZone.UK_ONLY,
      dataClassification: DataClassificationLevel.OFFICIAL,
    },
    create: {
      slug: settings.platformOrgSlug,
      name: settings.platformOrgName,
      regionCode: settings.platformRegionCode,
      tenantId: settings.platformTenantId,
      status: OrganizationStatus.ACTIVE,
      complianceTier: ComplianceTier.GOV_SECURE,
      dataResidency: DataResidencyZone.UK_ONLY,
      dataClassification: DataClassificationLevel.OFFICIAL,
    },
  });

  const role = await prisma.role.upsert({
    where: { orgId_name: { orgId: organization.id, name: settings.roleName } },
    update: {
      scope: RoleScope.GLOBAL,
      permissions: OWNER_ROLE_PERMISSIONS as Json,
    },
    create: {
      orgId: organization.id,
      name: settings.roleName,
      description: 'Platform bootstrap owner role',
      scope: RoleScope.GLOBAL,
      permissions: OWNER_ROLE_PERMISSIONS as Json,
    },
  });

  const globalAdmin = await upsertUser(settings.globalAdminEmail, settings.globalAdminName);
  const developmentAdmin = await upsertUser(settings.developmentAdminEmail, settings.developmentAdminName);

  await Promise.all([
    ensureMembership(organization.id, globalAdmin.id, role.id, 'bootstrap:global-admin'),
    ensureMembership(organization.id, developmentAdmin.id, role.id, 'bootstrap:development-admin'),
  ]);

  return {
    organizationId: organization.id,
    roleId: role.id,
    globalAdminUserId: globalAdmin.id,
    developmentAdminUserId: developmentAdmin.id,
  };
}

function resolveConfig(config: ColdStartConfig) {
  return {
    platformOrgSlug: config.platformOrgSlug ?? process.env.PLATFORM_ORG_SLUG ?? 'orgcentral-platform',
    platformOrgName: config.platformOrgName ?? process.env.PLATFORM_ORG_NAME ?? 'OrgCentral Platform',
    platformTenantId: config.platformTenantId ?? process.env.PLATFORM_TENANT_ID ?? 'orgcentral-platform',
    platformRegionCode: config.platformRegionCode ?? process.env.PLATFORM_ORG_REGION ?? 'UK-LON',
    globalAdminEmail: config.globalAdminEmail ?? process.env.GLOBAL_ADMIN_EMAIL ?? 'global.admin@example.com',
    globalAdminName: config.globalAdminName ?? process.env.GLOBAL_ADMIN_NAME ?? 'Global Admin',
    developmentAdminEmail: config.developmentAdminEmail ?? process.env.DEV_ADMIN_EMAIL ?? 'dev.admin@example.com',
    developmentAdminName: config.developmentAdminName ?? process.env.DEV_ADMIN_NAME ?? 'Dev Admin',
    roleName: config.roleName ?? process.env.GLOBAL_ADMIN_ROLE_NAME ?? 'owner',
  };
}

async function upsertUser(email: string, displayName: string) {
  return prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      displayName,
      status: MembershipStatus.ACTIVE,
    },
    create: {
      email: email.toLowerCase(),
      displayName,
      status: MembershipStatus.ACTIVE,
    },
  });
}

async function ensureMembership(orgId: string, userId: string, roleId: string, auditSource: string) {
  const timestamp = new Date();
  await prisma.membership.upsert({
    where: { orgId_userId: { orgId, userId } },
    update: {
      roleId,
      status: MembershipStatus.ACTIVE,
      metadata: {
        seedSource: auditSource,
        auditBatchId: randomUUID(),
      } as Json,
      activatedAt: timestamp,
      updatedBy: userId,
    },
    create: {
      orgId,
      userId,
      roleId,
      status: MembershipStatus.ACTIVE,
      invitedBy: null,
      invitedAt: timestamp,
      activatedAt: timestamp,
      metadata: {
        seedSource: auditSource,
        auditBatchId: randomUUID(),
      } as Json,
      createdBy: userId,
    },
  });
}
