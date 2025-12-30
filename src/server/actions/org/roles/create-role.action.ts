'use server';

import { authAction } from '@/server/actions/auth-action';
import { createRoleSchema, type CreateRoleInput } from './role-schema';
import { getRoleService } from '@/server/services/org/roles/role-service.provider';
import { revalidateTag } from 'next/cache';

const ROLE_ADMIN_PERMISSIONS = { organization: ['update'] };

export async function createRoleAction(input: CreateRoleInput) {
    const validated = createRoleSchema.parse(input);

    return authAction(
        {
            auditSource: 'action:org:roles:create',
            requiredPermissions: ROLE_ADMIN_PERMISSIONS,
            action: 'org.role.create',
            resourceType: 'org.role',
            resourceAttributes: { roleName: validated.name },
        },
        async ({ authorization }) => {
            const service = getRoleService();
            const role = await service.createRole({
                authorization,
                ...validated,
            });

            revalidateTag(`org-${authorization.orgId}-roles`, 'seconds');
            return { success: true, data: role };
        }
    );
}
