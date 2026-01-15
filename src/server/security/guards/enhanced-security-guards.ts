import { randomUUID } from 'node:crypto';
import type { DataClassificationLevel, DataResidencyZone, TenantScope } from '@/server/types/tenant';
import { isOrgRoleKey, type OrgPermissionMap, type OrgRoleKey } from '@/server/security/access-control';
import {
    authorizeOrgAccessRbacOnly,
} from '@/server/security/authorization/engine';
import { getGuardMembershipRepository } from './membership-repository';
import { getPermissionResolutionService } from '@/server/services/security/permission-resolution-service.provider';
import { appLogger } from '@/server/logging/structured-logger';
import type { EnhancedSecurityContext } from '@/server/types/enhanced-security-types';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';

export interface EnhancedOrgAccessInput {
    orgId: string;
    userId: string;
    requiredPermissions?: OrgPermissionMap;
    /** Alternative to multi-role gates: any one of these permission sets must be satisfied. */
    requiredAnyPermissions?: readonly OrgPermissionMap[];
    expectedClassification?: DataClassificationLevel;
    expectedResidency?: DataResidencyZone;
    auditSource?: string;
    correlationId?: string;
    requiresMfa?: boolean;
    piiAccessRequired?: boolean;
    dataBreachRisk?: boolean;
    authorizationReason?: string;
    ipAddress: string;
    userAgent: string;
    // ABAC fields
    action?: string;
    resourceType?: string;
    resourceAttributes?: Record<string, unknown>;
}

export interface EnhancedOrgAccessContext extends EnhancedSecurityContext {
    roleKey: OrgRoleKey | 'custom';
    requiresMfa: boolean;
    piiAccessRequired: boolean;
    dataBreachRisk: boolean;
    sessionToken: string;
    authorizedAt: Date;
    authorizationReason?: string;
    tenantScope: TenantScope;
}

export async function assertEnhancedOrgAccess(input: EnhancedOrgAccessInput): Promise<EnhancedOrgAccessContext> {
    if (!input.orgId || !input.userId) {
        throw new Error('orgId and userId are required for guard evaluation.');
    }

    const membership = await getGuardMembershipRepository().findMembership(input.orgId, input.userId);

    if (!membership) {
        throw new Error('Membership not found for the requested organization.');
    }

    if (membership.status !== 'ACTIVE') {
        throw new Error('Membership is not active for the requested organization.');
    }

    const knownRole = resolveRoleKey(membership.roleName);

    const dataResidency = membership.organization.dataResidency;
    const dataClassification = membership.organization.dataClassification;

    const grantedPermissions = await getPermissionResolutionService().resolveMembershipPermissions(membership);

    // Determine if MFA is required based on sensitivity of operation
    const requiresMfa = (input.requiresMfa ?? false) ||
        (input.piiAccessRequired ?? false) ||
        (input.dataBreachRisk ?? false) ||
        dataClassification === 'SECRET' ||
        dataClassification === 'TOP_SECRET';

    // Create enhanced security context
    const tenantScope: TenantScope = {
        orgId: input.orgId,
        dataResidency,
        dataClassification,
        auditSource: input.auditSource ?? 'enhanced-org-guard',
        auditBatchId: extractAuditBatchId(membership.metadata),
    };

    const enhancedContext: EnhancedOrgAccessContext = {
        orgId: input.orgId,
        userId: input.userId,
        roleKey: knownRole,
        roleName: membership.roleName ?? null,
        roleId: membership.roleId ?? null,
        roleScope: membership.roleScope ?? null,
        permissions: grantedPermissions,
        dataResidency,
        dataClassification,
        auditSource: input.auditSource ?? 'enhanced-org-guard',
        auditBatchId: tenantScope.auditBatchId,
        correlationId: input.correlationId ?? randomUUID(),
        sessionId: randomUUID(), // Generate a session ID for this access
        roles: [knownRole], // Convert single role to array for compatibility
        mfaVerified: !requiresMfa, // Will be set to true after MFA verification
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        authenticatedAt: new Date(),
        sessionExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        lastActivityAt: new Date(),
        tenantScope,
        requiresMfa,
        piiAccessRequired: input.piiAccessRequired ?? false,
        dataBreachRisk: input.dataBreachRisk ?? false,
        sessionToken: randomUUID(), // Unique token for this session
        authorizedAt: new Date(),
        authorizationReason: input.authorizationReason,
    };

    // Perform RBAC authorization
    authorizeOrgAccessRbacOnly(input, {
        orgId: enhancedContext.orgId,
        userId: enhancedContext.userId,
        roleKey: enhancedContext.roleKey,
        roleName: enhancedContext.roleName,
        roleId: enhancedContext.roleId,
        permissions: enhancedContext.permissions,
        dataResidency: enhancedContext.dataResidency,
        dataClassification: enhancedContext.dataClassification,
    });

    return enhancedContext;
}

export async function withEnhancedOrgContext<T>(
    input: EnhancedOrgAccessInput,
    handler: (context: EnhancedOrgAccessContext) => Promise<T>,
): Promise<T> {
    const context = await assertEnhancedOrgAccess(input);
    return handler(context);
}

export function assertSecureResourceAccess(
    context: RepositoryAuthorizationContext,
    resourceType: string,
    resourceId?: string,
    action = 'read'
): boolean {
    // Verify that the requesting context has access to the specific resource
    if (context.orgId !== context.tenantScope.orgId) {
        throw new Error('Tenant isolation violation detected');
    }

    // Check if the user has the required permissions for this action
    const requiredResource = `${resourceType}:${action}`;
    let hasPermission = false;

    // Check direct permissions
    for (const [resource, actions] of Object.entries(context.permissions)) {
        if (!actions || actions.length === 0) {
            continue;
        }
        if (resource === resourceType && actions.includes(action)) {
            hasPermission = true;
            break;
        }
        // Also check for wildcard permissions
        if (resource === '*' && actions.includes('*')) {
            hasPermission = true;
            break;
        }
        if (resource === requiredResource) {
            hasPermission = true;
            break;
        }
    }

    if (!hasPermission) {
        // Log security event for unauthorized access attempt
        appLogger.warn('security.guard.unauthorized', {
            resourceType,
            action,
            userId: context.userId,
        });
        return false;
    }

    // Additional checks based on data classification
    if (context.dataClassification === 'SECRET' || context.dataClassification === 'TOP_SECRET') {
        // Additional validation for highly classified data
        if (context.requiresMfa && !context.mfaVerified) {
            appLogger.warn('security.guard.mfa_required', {
                resourceType,
                classification: context.dataClassification,
                userId: context.userId,
            });
            return false;
        }
    }

    return true;
}

function resolveRoleKey(roleName?: string | null): OrgRoleKey | 'custom' {
    if (!roleName) {
        return 'custom';
    }
    return isOrgRoleKey(roleName) ? roleName : 'custom';
}

function extractAuditBatchId(metadata: unknown): string | undefined {
    if (!metadata || typeof metadata !== 'object') {
        return undefined;
    }

    const value = metadata as Record<string, unknown>;
    return typeof value.auditBatchId === 'string' ? value.auditBatchId : undefined;
}
