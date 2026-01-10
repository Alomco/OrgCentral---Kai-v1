'use server';

import { randomUUID } from 'node:crypto';
import { headers } from 'next/headers';
import { z } from 'zod';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import type { MemberActionState } from './shared';

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
    const requestId = randomUUID();
    const headerStore = await headers();

    const parsed = updateMemberStatusSchema.safeParse({
        targetUserId: formData.get('targetUserId') ?? '',
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid suspend input.', requestId };
    }

    const { authorization } = await getSessionContext(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members:suspend',
        },
    );

    try {
        await getMembershipService().suspendMembership({
            authorization,
            targetUserId: parsed.data.targetUserId,
        });
        return { status: 'success', message: 'Member suspended.', requestId };
    } catch (error) {
        return {
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to suspend member.',
            requestId,
        };
    }
}
