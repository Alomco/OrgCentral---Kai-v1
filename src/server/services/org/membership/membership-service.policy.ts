import { AuthorizationError } from '@/server/errors';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { MembershipStatus } from '@/server/types/prisma';

export const ORG_MEMBERSHIP_RESOURCE_TYPE = 'org.membership';

type MembershipAuditAction = 'roles.updated' | 'status.updated';

interface MembershipAuditPayload {
    targetUserId: string;
    roles?: string[];
    status?: MembershipStatus;
}

export async function recordMembershipAuditEvent(
    authorization: RepositoryAuthorizationContext,
    targetUserId: string,
    payload: MembershipAuditPayload,
    action: MembershipAuditAction,
): Promise<void> {
    const auditPayload: Record<string, unknown> = {
        targetUserId: payload.targetUserId,
        ...(payload.roles ? { roles: payload.roles } : {}),
        ...(payload.status ? { status: payload.status } : {}),
    };

    await recordAuditEvent({
        orgId: authorization.orgId,
        userId: authorization.userId,
        eventType: 'DATA_CHANGE',
        action: `membership.${action}`,
        resource: ORG_MEMBERSHIP_RESOURCE_TYPE,
        resourceId: targetUserId,
        payload: auditPayload,
        correlationId: authorization.correlationId,
        residencyZone: authorization.dataResidency,
        classification: authorization.dataClassification,
        auditSource: authorization.auditSource,
        auditBatchId: authorization.auditBatchId,
    });
}

export function enforceInviteRolePolicy(
    authorization: RepositoryAuthorizationContext,
    roles: string[],
): void {
    const primaryRole = roles[0] ?? 'member';
    const allowedRoles = resolveAllowedInviteRoles(authorization, [primaryRole]);
    if (!allowedRoles.includes(primaryRole)) {
        throw new AuthorizationError('You are not permitted to invite users with this role.');
    }
}

export function resolveAllowedInviteRoles(
    authorization: RepositoryAuthorizationContext,
    roleNames: string[],
): string[] {
    const uniqueRoles = new Set(roleNames.map((role) => role.trim()).filter((role) => role.length > 0));
    uniqueRoles.add('member');

    const roleKey = authorization.roleKey;
    if (roleKey === 'globalAdmin') {
        return Array.from(uniqueRoles);
    }

    if (roleKey === 'owner') {
        return Array.from(uniqueRoles).filter((role) => role !== 'globalAdmin');
    }

    if (roleKey === 'orgAdmin') {
        return Array.from(uniqueRoles).filter(
            (role) => role !== 'globalAdmin' && role !== 'owner',
        );
    }

    if (roleKey === 'hrAdmin') {
        return Array.from(uniqueRoles).filter((role) => role === 'member');
    }

    return ['member'];
}
