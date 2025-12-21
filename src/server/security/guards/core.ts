import { randomUUID } from 'node:crypto';

import type { OrganizationData } from '@/server/types/leave-types';
import type { DataClassificationLevel, DataResidencyZone, TenantScope } from '@/server/types/tenant';
import {
    combineRoleStatements,
    orgRoles,
    type OrgPermissionMap,
    type OrgRoleKey,
} from '@/server/security/access-control';
import {
    authorizeOrgAccessAbacOnly,
    authorizeOrgAccessRbacOnly,
} from '@/server/security/authorization/engine';

import { getGuardMembershipRepository } from './membership-repository';
import { isDevelopmentSuperAdminMembership } from './development-super-admin';
import {
    resolveGrantedPermissions,
} from './permission-requirements';
import type { AbacSubjectAttributes } from '@/server/types/abac-subject-attributes';

export interface OrgAccessInput {
    orgId: string;
    userId: string;
    requiredPermissions?: OrgPermissionMap;
    /** Alternative to multi-role gates: any one of these permission sets must be satisfied. */
    requiredAnyPermissions?: readonly OrgPermissionMap[];
    expectedClassification?: DataClassificationLevel;
    expectedResidency?: DataResidencyZone;
    auditSource?: string;
    correlationId?: string;
    // ABAC fields
    action?: string;
    resourceType?: string;
    resourceAttributes?: Record<string, unknown>;
}

export interface OrgAccessContext {
    orgId: string;
    userId: string;
    roleKey: OrgRoleKey | 'custom';
    /** Effective RBAC permissions for the member (built-in role statements or custom role.permissions). */
    permissions: OrgPermissionMap;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
    auditSource: string;
    auditBatchId?: string;
    correlationId: string;
    /** Development-only escape hatch for bootstrapped super admins. */
    developmentSuperAdmin?: boolean;
    /** Optional ABAC subject attributes (persisted on membership.metadata.abacSubjectAttributes). */
    abacSubjectAttributes?: AbacSubjectAttributes;
}

export function toTenantScope(context: OrgAccessContext): TenantScope {
    return {
        orgId: context.orgId,
        dataResidency: context.dataResidency,
        dataClassification: context.dataClassification,
        auditSource: context.auditSource,
        auditBatchId: context.auditBatchId,
    };
}

export function organizationToTenantScope(org: OrganizationData): TenantScope {
    return {
        orgId: org.id,
        dataResidency: org.dataResidency,
        dataClassification: org.dataClassification,
        auditSource: org.auditSource,
        auditBatchId: org.auditBatchId,
    };
}

export async function assertOrgAccess(input: OrgAccessInput): Promise<OrgAccessContext> {
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

    const grantedPermissions = resolveGrantedPermissions(
        knownRole,
        combineRoleStatements,
        membership.rolePermissions,
    );

    const developmentSuperAdmin = isDevelopmentSuperAdminMembership(membership.metadata, grantedPermissions);

    const context: OrgAccessContext = {
        orgId: input.orgId,
        userId: input.userId,
        roleKey: knownRole,
        permissions: grantedPermissions,
        dataResidency,
        dataClassification,
        auditSource: input.auditSource ?? 'org-guard',
        auditBatchId: extractAuditBatchId(membership.metadata),
        correlationId: input.correlationId ?? randomUUID(),
        developmentSuperAdmin: developmentSuperAdmin || undefined,
        abacSubjectAttributes: extractAbacSubjectAttributes(membership.metadata),
    };

    authorizeOrgAccessRbacOnly(input, context);

    return context;
}

export function extractAbacSubjectAttributes(metadata: unknown): AbacSubjectAttributes | undefined {
    if (!metadata || typeof metadata !== 'object') {
        return undefined;
    }

    const record = metadata as Record<string, unknown>;
    const raw = record.abacSubjectAttributes;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return undefined;
    }

    const value = raw as Record<string, unknown>;
    const result: AbacSubjectAttributes = {};

    for (const [key, entry] of Object.entries(value)) {
        if (key.trim().length === 0) {
            continue;
        }

        if (entry === null || typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean') {
            result[key] = entry;
            continue;
        }

        if (
            Array.isArray(entry) &&
            entry.every((item) => item === null || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        ) {
            result[key] = entry;
        }
    }

    return Object.keys(result).length > 0 ? result : undefined;
}

export async function withOrgContext<T>(
    input: OrgAccessInput,
    handler: (context: OrgAccessContext) => Promise<T>,
): Promise<T> {
    const context = await assertOrgAccess(input);
    return handler(context);
}

function resolveRoleKey(roleName?: string | null): OrgRoleKey | 'custom' {
    if (!roleName) {
        return 'custom';
    }
    const normalized = roleName as OrgRoleKey;
    return normalized in orgRoles ? normalized : 'custom';
}

function extractAuditBatchId(metadata: unknown): string | undefined {
    if (!metadata || typeof metadata !== 'object') {
        return undefined;
    }

    const value = metadata as Record<string, unknown>;
    return typeof value.auditBatchId === 'string' ? value.auditBatchId : undefined;
}

/**
 * Combines RBAC guard with ABAC evaluation.
 * Use this where the action requires attribute checks against a resource (e.g., doc owner/department)
 */
export async function assertOrgAccessWithAbac(input: OrgAccessInput): Promise<OrgAccessContext> {
    const context = await assertOrgAccess(input);

    await authorizeOrgAccessAbacOnly(input, context);
    return context;
}
