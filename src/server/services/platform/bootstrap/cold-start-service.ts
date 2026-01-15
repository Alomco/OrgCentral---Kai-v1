import { randomUUID } from 'node:crypto';
import type { DataClassificationLevel, DataResidencyZone, PrismaInputJsonValue } from '@/server/types/prisma';
import {
  buildColdStartServiceDependencies,
  type ColdStartPersistence,
  type ColdStartServiceDependencies,
} from '@/server/repositories/providers/platform/bootstrap/cold-start-service-dependencies';
import { resolveRoleTemplate } from '@/server/security/role-templates';
import { isOrgRoleKey, type OrgRoleKey } from '@/server/security/access-control';
import { DEFAULT_BOOTSTRAP_POLICIES } from '@/server/security/abac-constants';
import { setAbacPolicies } from '@/server/use-cases/org/abac/set-abac-policies';
import { buildAuthorizationContext } from '@/server/use-cases/shared/builders';

type Json = PrismaInputJsonValue;

const BOOTSTRAP_ABAC_AUDIT_SOURCE = 'bootstrap:cold-start';

const defaultDependencies = buildColdStartServiceDependencies();

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

function resolveDependencies(overrides?: Partial<ColdStartServiceDependencies>): ColdStartServiceDependencies {
  if (!overrides) {
    return defaultDependencies;
  }
  return { ...defaultDependencies, ...overrides };
}

export async function runColdStart(
  config: ColdStartConfig = {},
  overrides?: Partial<ColdStartServiceDependencies>,
): Promise<ColdStartResult> {
  const settings = resolveConfig(config);
  const dependencies = resolveDependencies(overrides);

  const { persistence } = dependencies;

  const organization = await persistence.upsertOrganization({
    slug: settings.platformOrgSlug,
    name: settings.platformOrgName,
    regionCode: settings.platformRegionCode,
    tenantId: settings.platformTenantId,
  });

  const roleKey: OrgRoleKey = isOrgRoleKey(settings.roleName) ? settings.roleName : 'owner';
  const template = resolveRoleTemplate(roleKey);

  const role = await persistence.upsertRole({
    orgId: organization.id,
    roleName: settings.roleName,
    description: 'Platform bootstrap owner role',
    permissions: mapPermissionsToFlags(template.permissions),
    isSystem: template.isSystem ?? true,
    isDefault: template.isDefault ?? true,
  });

  const globalAdmin = await upsertUser(persistence, settings.globalAdminEmail, settings.globalAdminName);
  const developmentAdmin = await upsertUser(persistence, settings.developmentAdminEmail, settings.developmentAdminName);

  await ensureAbacPolicies({
    orgId: organization.id,
    userId: globalAdmin.id,
    roleKey,
    dataResidency: organization.dataResidency,
    dataClassification: organization.dataClassification,
  }, dependencies);

  await Promise.all([
    ensureMembership(persistence, organization.id, globalAdmin.id, role.id, 'bootstrap:global-admin'),
    ensureMembership(persistence, organization.id, developmentAdmin.id, role.id, 'bootstrap:development-admin'),
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
    roleName: config.roleName ?? process.env.GLOBAL_ADMIN_ROLE_NAME ?? 'globalAdmin',
  };
}

function mapPermissionsToFlags(permissions: Partial<Record<string, readonly string[]>>): Record<string, boolean> {
  return Object.entries(permissions).reduce<Record<string, boolean>>((accumulator, [resource, actions]) => {
    if (!actions) {
      return accumulator;
    }
    for (const action of actions) {
      const key = `${resource}:${action}`;
      accumulator[key] = true;
    }
    return accumulator;
  }, {});
}

async function upsertUser(persistence: ColdStartPersistence, email: string, displayName: string) {
  return persistence.upsertUser({
    email,
    displayName,
  });
}

async function ensureMembership(
  persistence: ColdStartPersistence,
  orgId: string,
  userId: string,
  roleId: string,
  auditSource: string,
) {
  const metadata = {
    seedSource: auditSource,
    auditBatchId: randomUUID(),
  } as Json;

  await persistence.upsertMembership({
    orgId,
    userId,
    roleId,
    metadata,
  });
}

interface AbacBootstrapContext {
  orgId: string;
  userId: string;
  roleKey: OrgRoleKey;
  dataResidency: DataResidencyZone;
  dataClassification: DataClassificationLevel;
}

async function ensureAbacPolicies(
  context: AbacBootstrapContext,
  dependencies: ColdStartServiceDependencies,
): Promise<void> {
  const { policyRepository } = dependencies;
  const existing = await policyRepository.getPoliciesForOrg(context.orgId);
  if (existing.length > 0) {
    return;
  }

  const authorization = buildAuthorizationContext({
    orgId: context.orgId,
    userId: context.userId,
    roleKey: context.roleKey,
    dataResidency: context.dataResidency,
    dataClassification: context.dataClassification,
    auditSource: BOOTSTRAP_ABAC_AUDIT_SOURCE,
    tenantScope: {
      orgId: context.orgId,
      dataResidency: context.dataResidency,
      dataClassification: context.dataClassification,
      auditSource: BOOTSTRAP_ABAC_AUDIT_SOURCE,
    },
  });

  await setAbacPolicies(
    { policyRepository },
    { authorization, policies: DEFAULT_BOOTSTRAP_POLICIES },
  );
}
