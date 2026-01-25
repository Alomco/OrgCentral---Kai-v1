import { unstable_noStore as noStore } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod';

import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getRoleService } from '@/server/services/org';
import { getUserService, type UserServiceContract } from '@/server/services/org/users/user-service.provider';
import { resolveAllowedInviteRoles } from '@/server/services/org/membership/membership-service.policy';
import { assertOnboardingInviteSender } from '@/server/security/authorization/hr-guards/onboarding';
import { MemberActions } from './_components/member-actions';
import { OnboardingWizardPanel } from '../../hr/onboarding/_components/onboarding-wizard-panel';
import { OrgInvitationsPanel } from './_components/org-invitations-panel';
import {
    parseOrgMembersQuery,
    type OrgMembersSearchParams,
} from './_components/org-members-helpers';
import { OrgMembersPagination } from './_components/org-members-pagination';
import { OrgMembersFilters } from './_components/org-members-filters';
import { OrgMembersBulkActions } from './_components/org-members-bulk-actions';

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

export default async function OrgMembersPage({
    searchParams,
}: {
    searchParams?: Promise<OrgMembersSearchParams>;
}) {
    noStore();

    const headerStore = await headers();

    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['update'] },
            auditSource: 'ui:org-members',
        },
    );

    const userService: UserServiceContract = getUserService();
    const resolvedSearchParams = searchParams ? await searchParams : {};
    const query = parseOrgMembersQuery(resolvedSearchParams);
    const filters = {
        search: query.search.length > 0 ? query.search : undefined,
        status: query.status,
        role: query.role,
    };
    const sort = { key: query.sort, direction: query.direction };
    const { users: rawUsers, totalCount, page, pageSize } =
        await userService.listUsersInOrganizationPaged({
            authorization,
            page: query.page,
            pageSize: query.pageSize,
            filters,
            sort,
        });
    const users = z.array(orgUserSchema).parse(rawUsers);
    const roles = await getRoleService().listRoles({ authorization });
    const roleNames = roles.map((role) => role.name);
    const roleOptions = roles.map((role) => ({
        name: role.name,
        description: role.description ?? null,
    }));
    const allowedRoleNames = resolveAllowedInviteRoles(
        authorization,
        roleOptions.map((role) => role.name),
    );
    const allowedRoleOptions = roleOptions.filter((role) => allowedRoleNames.includes(role.name));
    const defaultRole = allowedRoleOptions[0]?.name ?? 'member';
    const filterRoleNames = roleNames.length > 0 ? roleNames : ['member'];
    let canManageOnboarding = false;
    try {
        await assertOnboardingInviteSender({ authorization });
        canManageOnboarding = true;
    } catch {
        canManageOnboarding = false;
    }
    const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
    const rangeStart = totalCount > 0 ? (page - 1) * pageSize + 1 : 0;
    const rangeEnd = totalCount > 0 ? Math.min(page * pageSize, totalCount) : 0;

    return (
        <div className="space-y-6 p-6">
            <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[oklch(var(--muted-foreground))]">Members</p>
                <h1 className="text-2xl font-semibold text-[oklch(var(--foreground))]">Organization members</h1>
                <p className="text-sm text-[oklch(var(--muted-foreground))]">Users with access to this organization.</p>
            </div>

            <OnboardingWizardPanel
                roleOptions={
                    allowedRoleOptions.length > 0
                        ? allowedRoleOptions
                        : [{ name: 'member', description: 'Standard employee access.' }]
                }
                defaultRole={defaultRole}
                canManageOnboarding={canManageOnboarding}
            />

            <OrgInvitationsPanel authorization={authorization} />

            <div className="rounded-2xl bg-[oklch(var(--card)/0.6)] p-6 backdrop-blur">
                <OrgMembersFilters query={query} roleNames={filterRoleNames} />
                <OrgMembersBulkActions roleNames={filterRoleNames} />
                <div className="mt-4 grid gap-3">
                    {users.length === 0 ? (
                        <p className="text-sm text-[oklch(var(--muted-foreground))]">No users found.</p>
                    ) : (
                        users.map((user) => {
                            const displayLabel = user.displayName.trim().length > 0 ? user.displayName : user.email;
                            const membership = resolveMembershipForOrg(user, authorization.orgId);
                            const status = membership?.status ?? 'INVITED';
                            const initialRoles = resolveUserRolesForOrg(user, authorization.orgId).join(', ');

                            return (
                                <div
                                    key={user.id}
                                    className="flex flex-col gap-2 rounded-xl bg-[oklch(var(--muted)/0.35)] p-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            name="userIds"
                                            value={user.id}
                                            form="bulk-members-form"
                                            aria-label={`Select ${displayLabel}`}
                                            data-bulk-member="select"
                                            className="mt-1 h-4 w-4 rounded border-[oklch(var(--border))] text-[oklch(var(--primary))]"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-[oklch(var(--foreground))]">
                                                {displayLabel}
                                            </p>
                                            <p className="text-xs text-[oklch(var(--muted-foreground))]">{user.email}</p>
                                        </div>
                                    </div>

                                    <MemberActions userId={user.id} initialRoles={initialRoles} status={status} />
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="mt-4">
                    <OrgMembersPagination
                        query={{ ...query, page, pageSize }}
                        totalCount={totalCount}
                        rangeStart={rangeStart}
                        rangeEnd={rangeEnd}
                        pageCount={pageCount}
                    />
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

