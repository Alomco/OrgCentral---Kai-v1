import { headers } from 'next/headers';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';

import { InvitePolicyForm, initialInvitePolicyState, type InvitePolicyState } from './_components/invite-policy-form';
import { resolveOrgContext } from '@/server/org/org-context';
import { invalidateOrgCache, registerOrgCacheTag } from '@/server/lib/cache-tags';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { prisma } from '@/server/lib/prisma';

const invitePolicySchema = z.object({
    open: z.boolean().default(false),
});

const organizationSettingsSchema = z.looseObject({
    invites: invitePolicySchema.optional(),
});

const INVITE_POLICY_CACHE_SCOPE = 'org:invite-policy';

export default async function OrgSettingsPage() {
    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const session = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['manage'] },
            auditSource: 'ui:org-settings:read',
        },
    );

    registerOrgCacheTag(
        session.authorization.orgId,
        INVITE_POLICY_CACHE_SCOPE,
        session.authorization.dataClassification,
        session.authorization.dataResidency,
    );

    const org = await prisma.organization.findUnique({
        where: { id: orgContext.orgId },
        select: { settings: true },
    });

    const parsedSettings = organizationSettingsSchema.safeParse(org?.settings ?? {});
    const initialOpen = parsedSettings.success ? (parsedSettings.data.invites?.open ?? false) : false;

    return (
        <div className="space-y-6 p-6">
            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Settings</p>
                <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Access & invites</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Control how people can join your organization ({orgContext.orgId}).
                </p>
            </div>
            <InvitePolicyForm action={updateInvitePolicy} defaultOpen={initialOpen} />
        </div>
    );
}

export async function updateInvitePolicy(
    _previous: InvitePolicyState = initialInvitePolicyState,
    formData: FormData,
): Promise<InvitePolicyState> {
    'use server';

    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const parsed = invitePolicySchema.safeParse({
        open: formData.get('invite-open') === 'on',
    });

    if (!parsed.success) {
        return { status: 'error', message: 'Invalid form data', open: _previous.open };
    }

    const session = await getSessionContext(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['manage'] },
            auditSource: 'ui:org-settings:invite-policy',
        },
    );

    const org = await prisma.organization.findUnique({
        where: { id: orgContext.orgId },
        select: { settings: true },
    });

    const settingsObject = coerceJsonObject(org?.settings ?? {});
    const nextSettings: Prisma.InputJsonObject = {
        ...settingsObject,
        invites: { open: parsed.data.open },
    };

    await prisma.organization.update({
        where: { id: orgContext.orgId },
        data: { settings: nextSettings },
    });

    await invalidateOrgCache(
        session.authorization.orgId,
        INVITE_POLICY_CACHE_SCOPE,
        session.authorization.dataClassification,
        session.authorization.dataResidency,
    );

    return {
        status: 'success',
        message: parsed.data.open ? 'Invites are now open' : 'Invites are restricted',
        open: parsed.data.open,
    };
}

function coerceJsonObject(value: Prisma.JsonValue): Prisma.JsonObject {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    return {};
}
