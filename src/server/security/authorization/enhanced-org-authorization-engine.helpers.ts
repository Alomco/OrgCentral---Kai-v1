import type { DataClassificationLevel } from '@/server/types/tenant';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type {
  OrgAuthorizationContext,
  OrgAuthorizationInput,
} from './engine/types';
import { evaluateAbac, makeSubject } from '@/server/security/abac';
import {
  buildAnyPermissionProfiles,
  normalizePermissionRequirement,
} from './permission-requirements';
import {
  permissionsSatisfy,
  satisfiesAnyPermissionProfile,
} from '@/server/security/authorization/permission-utils';

export type EnhancedOrgAuthorizationContext = OrgAuthorizationContext & RepositoryAuthorizationContext;

// Enhanced input with additional security properties
export interface EnhancedOrgAuthorizationInput extends OrgAuthorizationInput {
  requiresMfa?: boolean;
  piiAccessRequired?: boolean;
  dataBreachRisk?: boolean;
  authorizationReason?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionToken?: string;
}

const classificationRank: Record<DataClassificationLevel, number> = {
  OFFICIAL: 1,
  OFFICIAL_SENSITIVE: 2,
  SECRET: 3,
  TOP_SECRET: 4,
};

/**
 * Enhanced tenant constraint validation with additional security checks
 */
export function assertEnhancedTenantConstraints(
  input: EnhancedOrgAuthorizationInput,
  context: EnhancedOrgAuthorizationContext,
): void {
  if (
    input.expectedClassification &&
    classificationRank[context.dataClassification] < classificationRank[input.expectedClassification]
  ) {
    throw new Error('User clearance is insufficient for this classification.');
  }

  if (input.expectedResidency && input.expectedResidency !== context.dataResidency) {
    throw new Error('Requested residency zone mismatch.');
  }

  if (input.requiresMfa && !context.mfaVerified) {
    throw new Error('MFA verification required for this operation.');
  }

  if (input.piiAccessRequired && !context.piiAccessRequired) {
    throw new Error('Explicit PII access authorization required for this operation.');
  }

  if (input.dataBreachRisk && context.dataClassification === 'TOP_SECRET') {
    const lastActivity = context.lastActivityAt?.getTime();
    if (lastActivity && Date.now() - lastActivity > 30 * 60 * 1000) {
      throw new Error('Session timeout - re-authentication required for high-risk operation with TOP_SECRET data.');
    }
  }
}

/**
 * Enhanced RBAC validation with additional security checks
 */
export function assertEnhancedRbac(
  input: EnhancedOrgAuthorizationInput,
  context: EnhancedOrgAuthorizationContext,
): void {
  const requiredPermissions = normalizePermissionRequirement(input.requiredPermissions);
  const requiredAnyPermissionProfiles = buildAnyPermissionProfiles(input.requiredAnyPermissions);

  const hasRbacRequirements =
    Object.keys(requiredPermissions).length > 0 || requiredAnyPermissionProfiles.length > 0;

  if (!hasRbacRequirements) {
    return;
  }

  const grantedPermissions = context.permissions;

  const allowed =
    permissionsSatisfy(grantedPermissions, requiredPermissions) &&
    satisfiesAnyPermissionProfile(grantedPermissions, requiredAnyPermissionProfiles);

  if (!allowed) {
    throw new Error('RBAC check failed for the requested action.');
  }

  if (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET') {
    if (context.roleKey === 'custom') {
      throw new Error('Predefined roles required for access to SECRET or TOP_SECRET data.');
    }
  }
}

/**
 * Enhanced ABAC validation with additional context
 */
export async function assertEnhancedAbac(
  input: EnhancedOrgAuthorizationInput,
  context: EnhancedOrgAuthorizationContext,
): Promise<void> {
  if (!input.action || !input.resourceType) {
    return;
  }

  const baseRole = context.roleKey === 'custom' ? 'custom' : context.roleKey;
  const roleTokens = new Set<string>([baseRole]);
  if (context.roleName && context.roleName !== baseRole) {
    roleTokens.add(context.roleName);
  }

  const subject = makeSubject(
    input.orgId,
    input.userId,
    Array.from(roleTokens),
    {
      residency: context.dataResidency,
      classification: context.dataClassification,
      mfaVerified: context.mfaVerified,
      requiresMfa: context.requiresMfa,
      piiAccessRequired: context.piiAccessRequired,
      dataBreachRisk: context.dataBreachRisk,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
  );

  const resourceAttributes = {
    residency: context.dataResidency,
    classification: context.dataClassification,
    requiresMfa: input.requiresMfa,
    piiAccessRequired: input.piiAccessRequired,
    dataBreachRisk: input.dataBreachRisk,
    ...(input.resourceAttributes ?? {}),
  };

  const allowed = await evaluateAbac(
    input.orgId,
    input.action,
    input.resourceType,
    subject,
    resourceAttributes,
  );

  if (!allowed) {
    throw new Error('ABAC policy denied this action.');
  }

  if (context.dataClassification === 'TOP_SECRET' && !context.mfaVerified) {
    throw new Error('MFA verification required for ABAC-authorized access to TOP_SECRET data.');
  }
}

/**
 * Validates session security properties
 */
export function validateSessionSecurity(
  input: EnhancedOrgAuthorizationInput,
  context: EnhancedOrgAuthorizationContext,
): void {
  if (input.sessionToken && context.sessionToken && input.sessionToken !== context.sessionToken) {
    throw new Error('Invalid session token.');
  }

  if (context.sessionExpiresAt && new Date() > context.sessionExpiresAt) {
    throw new Error('Session has expired.');
  }

  if ((context.piiAccessRequired || context.dataBreachRisk) && !input.authorizationReason) {
    throw new Error('Authorization reason required for sensitive operations.');
  }

  if (
    (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET') &&
    input.ipAddress &&
    context.ipAddress &&
    input.ipAddress !== context.ipAddress
  ) {
    throw new Error('IP address changed during sensitive session. Re-authentication required.');
  }
}
