'use server';

import { authAction } from '@/server/actions/auth-action';
import { bulkUpdateRolesSchema, type BulkUpdateRolesInput } from './bulk-update-roles-schema';
import { getMembershipService } from '@/server/services/org/membership/membership-service.provider';
import { revalidateTag } from 'next/cache';

const ROLE_UPDATE_PERMISSIONS = { member: ['update'] }; // or appropriate permissions

export async function bulkUpdateRolesAction(input: BulkUpdateRolesInput) {
    const validated = bulkUpdateRolesSchema.parse(input);

    return authAction(
        {
            auditSource: 'action:org:membership:bulk-update-roles',
            requiredPermissions: ROLE_UPDATE_PERMISSIONS,
            action: 'org.membership.bulk-update-roles',
            resourceType: 'org.membership',
            resourceAttributes: {
                targetUserIds: validated.targetUserIds,
                roles: validated.roles
            },
        },
        async ({ authorization }) => {
            const service = getMembershipService();
            await service.bulkUpdateMembershipRoles({
                authorization,
                targetUserIds: validated.targetUserIds,
                roles: validated.roles,
            });

            revalidateTag(`org-${authorization.orgId}-members`, 'seconds');
            // Also invalidate individual users if possible, or just the list.
            // Invalidating the general list tag is usually sufficient for UI updates.

            return { success: true };
        }
    );
}
