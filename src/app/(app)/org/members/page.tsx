import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { resolveOrgContext } from '@/server/org/org-context';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getRoleService } from '@/server/services/org';
import { getUserService, type UserServiceContract } from '@/server/services/org/users/user-service.provider';
import { MemberActions } from './_components/member-actions';
import { InviteMemberForm } from './_components/invite-member-form';

const membershipStatusSchema = z.enum(['INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED']);

const membershipSchema = z
    .object({
        organizationId: z.string().trim().min(1),
        roles: z.array(z.string()),
        status: membershipStatusSchema.optional(),
    })
    .loose();

const orgUserSchema = z
    .object({
        id: z.string().trim().min(1),
        email: z.string().trim().min(1),
        displayName: z.string(),
        roles: z.array(z.string()),
        memberships: z.array(membershipSchema),
    })
    .loose();

type OrgUser = z.infer<typeof orgUserSchema>;

export default async function OrgMembersPage() {
    noStore();

    const orgContext = await resolveOrgContext();
    const headerStore = await headers();

    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            orgId: orgContext.orgId,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members',
        },
    );

    const userService: UserServiceContract = getUserService();
    const rawUsers = await userService.listUsersInOrganization({ authorization });
    const users = z.array(orgUserSchema).parse(rawUsers);
    const roles = await getRoleService().listRoles({ authorization });
    const roleNames = roles.map((role) => role.name);

    return (
        <div className="space-y-6 p-6">
            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">Members</p>
                <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">Organization members</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Users with access to this organization.</p>
            </div>

            <InviteMemberForm roles={roleNames.length > 0 ? roleNames : ['member']} />

            <div className="rounded-2xl bg-[hsl(var(--card)/0.6)] p-6 backdrop-blur">
                <div className="grid gap-3">
                    {users.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">No users found.</p>
                    ) : (
                        users.map((user) => {
                            const displayLabel = user.displayName.trim().length > 0 ? user.displayName : user.email;
                            const membership = resolveMembershipForOrg(user, authorization.orgId);
                            const status = membership?.status ?? 'INVITED';
                            const initialRoles = resolveUserRolesForOrg(user, authorization.orgId).join(', ');

                            return (
                                <div
                                    key={user.id}
                                    className="flex flex-col gap-1 rounded-xl bg-[hsl(var(--muted)/0.35)] p-3"
                                >
                                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">{displayLabel}</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{user.email}</p>

                                    <MemberActions userId={user.id} initialRoles={initialRoles} status={status} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

function resolveUserRolesForOrg(
    user: Pick<OrgUser, 'memberships' | 'roles'>,
    orgId: string,
): string[] {
    const membership = user.memberships.find((candidate) => candidate.organizationId === orgId);
    if (membership) {
        return membership.roles;
    }

    return user.roles;
}

function resolveMembershipForOrg(
    user: Pick<OrgUser, 'memberships'>,
    orgId: string,
): z.infer<typeof membershipSchema> | undefined {
    return user.memberships.find((candidate) => candidate.organizationId === orgId);
}
