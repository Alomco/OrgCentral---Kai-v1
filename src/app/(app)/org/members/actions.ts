'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { resolveOrgContext } from '@/server/org/org-context';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import type { AbacSubjectAttributes } from '@/server/types/abac-subject-attributes';

export type MemberActionState =
    | { status: 'idle' }
    | { status: 'success'; message: string }
    | { status: 'error'; message: string };

export type InviteMemberActionState =
    | { status: 'idle' }
    | { status: 'success'; message: string; token: string; alreadyInvited: boolean }
    | { status: 'error'; message: string };

const inviteMemberSchema = z
    .object({
        email: z.email(),
        role: z.string().trim().min(1),
        abacSubjectAttributesJson: z.string().trim().optional(),
    })
    .strict();

export async function inviteMemberAction(
    _previous: InviteMemberActionState,
    formData: FormData,
): Promise<InviteMemberActionState> {
    void _previous;
    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const parsed = inviteMemberSchema.safeParse({
        email: formData.get('email') ?? '',
        role: formData.get('role') ?? '',
        abacSubjectAttributesJson: formData.get('abacSubjectAttributesJson') ?? undefined,
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid invitation input.' };
    }

    const abacSubjectAttributes = parseAbacSubjectAttributes(parsed.data.abacSubjectAttributesJson);
    if (parsed.data.abacSubjectAttributesJson && !abacSubjectAttributes) {
        return { status: 'error', message: 'ABAC subject attributes must be valid JSON (object of primitives/arrays).' };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { member: ['invite'] },
            auditSource: 'ui:org-members:invite',
            action: 'invite',
            resourceType: 'org.invitation',
            resourceAttributes: {
                email: parsed.data.email,
                role: parsed.data.role,
            },
        },
    );

    try {
        const inviteResultSchema = z
            .object({
                token: z.string().trim().min(1),
                alreadyInvited: z.boolean(),
            })
            .strict();

        const getMembershipServiceTyped = getMembershipService as () => {
            inviteMember(input: {
                authorization: RepositoryAuthorizationContext;
                email: string;
                roles: string[];
                abacSubjectAttributes?: AbacSubjectAttributes;
            }): Promise<{ token: string; alreadyInvited: boolean }>;
        };
        const membershipService = getMembershipServiceTyped();
        const result = inviteResultSchema.parse(
            await membershipService.inviteMember({
                authorization,
                email: parsed.data.email,
                roles: [parsed.data.role],
                abacSubjectAttributes: abacSubjectAttributes ?? undefined,
            }),
        );

        return {
            status: 'success',
            message: result.alreadyInvited ? 'An active invitation already exists for this email.' : 'Invitation created.',
            token: result.token,
            alreadyInvited: result.alreadyInvited,
        };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to invite member.',
        };
    }
}

const updateMemberRolesSchema = z
    .object({
        targetUserId: z.string().trim().min(1),
        roles: z.string().trim().min(1),
    })
    .strict();

export async function updateMemberRolesAction(
    _previous: MemberActionState,
    formData: FormData,
): Promise<MemberActionState> {
    void _previous;
    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const parsed = updateMemberRolesSchema.safeParse({
        targetUserId: formData.get('targetUserId') ?? '',
        roles: formData.get('roles') ?? '',
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid role update input.' };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members:update-roles',
        },
    );

    const roles = normalizeRoleList(parsed.data.roles);

    try {
        await getMembershipService().updateMembershipRoles({
            authorization,
            targetUserId: parsed.data.targetUserId,
            roles,
        });
        return { status: 'success', message: 'Member roles updated.' };
    } catch (error) {
        return { status: 'error', message: error instanceof Error ? error.message : 'Failed to update roles.' };
    }
}

const updateMemberStatusSchema = z
    .object({
        targetUserId: z.string().trim().min(1),
    })
    .strict();

export async function suspendMemberAction(
    _previous: MemberActionState,
    formData: FormData,
): Promise<MemberActionState> {
    void _previous;
    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const parsed = updateMemberStatusSchema.safeParse({
        targetUserId: formData.get('targetUserId') ?? '',
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid suspend input.' };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members:suspend',
        },
    );

    try {
        await getMembershipService().suspendMembership({
            authorization,
            targetUserId: parsed.data.targetUserId,
        });
        return { status: 'success', message: 'Member suspended.' };
    } catch (error) {
        return { status: 'error', message: error instanceof Error ? error.message : 'Failed to suspend member.' };
    }
}

export async function resumeMemberAction(
    _previous: MemberActionState,
    formData: FormData,
): Promise<MemberActionState> {
    void _previous;
    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const parsed = updateMemberStatusSchema.safeParse({
        targetUserId: formData.get('targetUserId') ?? '',
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid resume input.' };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members:resume',
        },
    );

    try {
        await getMembershipService().resumeMembership({
            authorization,
            targetUserId: parsed.data.targetUserId,
        });
        return { status: 'success', message: 'Member resumed.' };
    } catch (error) {
        return { status: 'error', message: error instanceof Error ? error.message : 'Failed to resume member.' };
    }
}

function normalizeRoleList(input: string): string[] {
    const roles = input
        .split(',')
        .map((role) => role.trim())
        .filter((role) => role.length > 0);

    const first = roles[0];
    return [typeof first === 'string' ? first : 'member'];
}

function parseAbacSubjectAttributes(input?: string): AbacSubjectAttributes | null {
    const trimmed = input?.trim();
    if (!trimmed) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(trimmed);
    } catch {
        return null;
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return null;
    }

    const record = parsed as Record<string, unknown>;
    const result: AbacSubjectAttributes = {};

    for (const [key, raw] of Object.entries(record)) {
        if (key.trim().length === 0) {
            continue;
        }

        if (raw === null || typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
            result[key] = raw;
            continue;
        }

        if (
            Array.isArray(raw) &&
            raw.every((item) => item === null || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')
        ) {
            result[key] = raw;
        }
    }

    return Object.keys(result).length > 0 ? result : null;
}
