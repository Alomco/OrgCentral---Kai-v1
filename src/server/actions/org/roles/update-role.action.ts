'use server';

import { authAction } from '@/server/actions/auth-action';
import { updateRoleSchema, type UpdateRoleInput } from './role-schema';
import { getRoleService } from '@/server/services/org/roles/role-service.provider';
import { revalidateTag } from 'next/cache';

const ROLE_ADMIN_PERMISSIONS = { organization: ['update'] };

export async function updateRoleAction(input: UpdateRoleInput) {
    const validated = updateRoleSchema.parse(input);

    return authAction(
        {
            auditSource: 'action:org:roles:update',
            requiredPermissions: ROLE_ADMIN_PERMISSIONS,
            action: 'org.role.update',
            resourceType: 'org.role',
            resourceAttributes: { roleId: validated.roleId },
        },
        async ({ authorization }) => {
            const service = getRoleService();
            const role = await service.updateRole({
                authorization,
                ...validated,
            });

            revalidateTag(`org-${authorization.orgId}-roles`, 'seconds');
            revalidateTag(`role-${validated.roleId}`, 'seconds');
            return { success: true, data: role };
        }
    );
}
