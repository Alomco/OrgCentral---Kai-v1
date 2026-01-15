import { z } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { ValidationError } from '@/server/errors';
import { listInvitations, resendInvitation, revokeInvitation } from '@/server/services/org/invitations/invitation-service';

const statusSchema = z.enum(['pending', 'accepted', 'expired', 'declined', 'revoked']);

const listQuerySchema = z.object({
    status: statusSchema.optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
});

const revokeSchema = z.object({
    reason: z.string().trim().min(1).optional(),
});

const AUDIT_LIST = 'api:org:invitations:list';
const AUDIT_REVOKE = 'api:org:invitations:revoke';
const AUDIT_RESEND = 'api:org:invitations:resend';
const RESOURCE_TYPE_INVITATION = 'org.invitation';

function normalizeOrgId(orgId: string): string {
    const trimmed = orgId.trim();
    if (!trimmed) {
        throw new ValidationError('Organization id is required.');
    }
    return trimmed;
}

function normalizeToken(token: string): string {
    const trimmed = token.trim();
    if (!trimmed) {
        throw new ValidationError('Invitation token is required.');
    }
    return trimmed;
}

export async function listInvitationsController(request: Request, orgId: string) {
    const normalizedOrgId = normalizeOrgId(orgId);
    const url = new URL(request.url);
    const parsed = listQuerySchema.parse({
        status: url.searchParams.get('status') ?? undefined,
        limit: url.searchParams.get('limit') ?? undefined,
    });

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { member: ['invite'] },
            auditSource: AUDIT_LIST,
            action: 'org.invitation.list',
            resourceType: RESOURCE_TYPE_INVITATION,
        },
    );

    return listInvitations(authorization, parsed.status, parsed.limit);
}

export async function revokeInvitationController(request: Request, orgId: string, token: string) {
    const normalizedOrgId = normalizeOrgId(orgId);
    const normalizedToken = normalizeToken(token);
    const body = await readJson(request);
    const parsed = revokeSchema.parse(body ?? {});

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { member: ['invite'] },
            auditSource: AUDIT_REVOKE,
            action: 'org.invitation.revoke',
            resourceType: RESOURCE_TYPE_INVITATION,
            resourceAttributes: { token: normalizedToken },
        },
    );

    return revokeInvitation(authorization, normalizedToken, parsed.reason);
}

export async function resendInvitationController(request: Request, orgId: string, token: string) {
    const normalizedOrgId = normalizeOrgId(orgId);
    const normalizedToken = normalizeToken(token);

    const { authorization } = await getSessionContext(
        {},
        {
            headers: request.headers,
            orgId: normalizedOrgId,
            requiredPermissions: { member: ['invite'] },
            auditSource: AUDIT_RESEND,
            action: 'org.invitation.resend',
            resourceType: RESOURCE_TYPE_INVITATION,
            resourceAttributes: { token: normalizedToken },
        },
    );

    return resendInvitation(authorization, normalizedToken);
}
