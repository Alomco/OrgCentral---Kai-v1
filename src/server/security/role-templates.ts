import type { RoleScope } from '@prisma/client';
import type { OrgPermissionMap } from './access-control';
import type { OrgRoleKey } from './role-constants';
import { globalAdminTemplate, ownerTemplate } from './role-templates.global';
import { complianceTemplate, managerTemplate, memberTemplate } from './role-templates.others';
import { hrAdminTemplate, orgAdminTemplate } from './role-templates.admins';

export interface RoleTemplate {
    name: OrgRoleKey;
    description: string;
    scope: RoleScope;
    permissions: OrgPermissionMap;
    inherits?: readonly OrgRoleKey[];
    isSystem?: boolean;
    isDefault?: boolean;
}

const templates = [
    globalAdminTemplate,
    ownerTemplate,
    orgAdminTemplate,
    hrAdminTemplate,
    managerTemplate,
    complianceTemplate,
    memberTemplate,
] as const satisfies readonly RoleTemplate[];

export const ROLE_TEMPLATES: Record<OrgRoleKey, RoleTemplate> = templates.reduce((accumulator, template) => {
    accumulator[template.name] = template;
    return accumulator;
}, {} as Record<OrgRoleKey, RoleTemplate>);

export function resolveRoleTemplate(roleKey: OrgRoleKey): RoleTemplate {
    return ROLE_TEMPLATES[roleKey];
}
export function combineRoleTemplates(roleKeys: OrgRoleKey[]): OrgPermissionMap {
    return roleKeys.reduce<OrgPermissionMap>((accumulator, key) => {
        const statements = ROLE_TEMPLATES[key].permissions as Record<string, string[]>;
        for (const [resource, actions] of Object.entries(statements)) {
            const existing = accumulator[resource] ?? [];
            const merged = new Set([...(existing), ...(Array.isArray(actions) ? actions : [])]);
            accumulator[resource] = Array.from(merged);
        }
        return accumulator;
    }, {});
}
