import { createAccessControl } from 'better-auth/plugins/access';

const STATEMENTS = {
    organization: ['create', 'read', 'update', 'delete', 'governance'],
    member: ['read', 'invite', 'update', 'remove'],
    invitation: ['create', 'cancel'],
    audit: ['read', 'write'],
    cache: ['tag', 'invalidate'],
    residency: ['enforce'],
    // HR (minimal set needed to unblock People guards and capability checks)
    employeeProfile: ['read', 'list', 'create', 'update', 'delete'],
    employmentContract: ['read', 'list', 'create', 'update', 'delete'],
};

export const orgAccessControl = createAccessControl(STATEMENTS);

export const orgRoles = {
    owner: orgAccessControl.newRole({
        organization: STATEMENTS.organization,
        member: STATEMENTS.member,
        invitation: STATEMENTS.invitation,
        audit: STATEMENTS.audit,
        cache: STATEMENTS.cache,
        residency: STATEMENTS.residency,
        employeeProfile: STATEMENTS.employeeProfile,
        employmentContract: STATEMENTS.employmentContract,
    }),
    orgAdmin: orgAccessControl.newRole({
        organization: ['read', 'update'],
        member: ['read', 'invite', 'update'],
        invitation: STATEMENTS.invitation,
        cache: STATEMENTS.cache,
        employeeProfile: STATEMENTS.employeeProfile,
        employmentContract: STATEMENTS.employmentContract,
    }),
    compliance: orgAccessControl.newRole({
        audit: STATEMENTS.audit,
        residency: STATEMENTS.residency,
        organization: ['read'],
    }),
    member: orgAccessControl.newRole({
        organization: ['read'],
        employeeProfile: ['read', 'list'],
        employmentContract: ['read', 'list'],
    }),
} as const;

export type OrgRoleKey = keyof typeof orgRoles;
export type OrgPermissionMap = Partial<Record<string, string[]>>;

export function combineRoleStatements(roleKeys: OrgRoleKey[]): OrgPermissionMap {
    return roleKeys.reduce<OrgPermissionMap>((accumulator, key) => {
        const statements = orgRoles[key].statements as Record<string, string[]>;
        for (const [resource, actions] of Object.entries(statements)) {
            const existing = accumulator[resource] ?? [];
            const merged = new Set([...(existing), ...(Array.isArray(actions) ? actions : [])]);
            accumulator[resource] = Array.from(merged);
        }
        return accumulator;
    }, {});
}
