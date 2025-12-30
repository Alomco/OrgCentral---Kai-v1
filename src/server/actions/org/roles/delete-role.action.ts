'use server';

import { authAction } from '@/server/actions/auth-action';
import { deleteRoleSchema, type DeleteRoleInput } from './role-schema';
import { getRoleService } from '@/server/services/org/roles/role-service.provider';
import { revalidateTag } from 'next/cache';

const ROLE_ADMIN_PERMISSIONS = { organization: ['update'] };

export async function deleteRoleAction(input: DeleteRoleInput) {
    const validated = deleteRoleSchema.parse(input);

    return authAction(
        {
            auditSource: 'action:org:roles:delete',
            requiredPermissions: ROLE_ADMIN_PERMISSIONS,
            action: 'org.role.delete',
            resourceType: 'org.role',
            resourceAttributes: { roleId: validated.roleId },
        },
        async ({ authorization }) => {
            const service = getRoleService();
            await service.deleteRole({
                authorization,
                roleId: validated.roleId,
            });

            revalidateTag(`org-${authorization.orgId}-roles`, 'seconds');
            revalidateTag(`role-${validated.roleId}`, 'seconds');
            return { success: true };
        }
    );
}
