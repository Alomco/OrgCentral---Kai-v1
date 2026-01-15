import {
    MembershipStatus,
    OrganizationStatus,
    type PrismaClientInstance,
} from '@/server/types/prisma';
import { isOrgRoleKey, type OrgRoleKey } from '@/server/security/access-control';
import type { ICronTenantRepository, CronOrgRecord, CronMemberRecord } from '@/server/repositories/contracts/platform/cron/cron-tenant-repository-contract';

export class PrismaCronTenantRepository implements ICronTenantRepository {
    constructor(private readonly prisma: PrismaClientInstance) { }

    async listActiveOrganizations(orgIds?: string[]): Promise<CronOrgRecord[]> {
        const where = orgIds?.length
            ? { id: { in: Array.from(new Set(orgIds)) }, status: OrganizationStatus.ACTIVE }
            : { status: OrganizationStatus.ACTIVE };

        const organizations = await this.prisma.organization.findMany({
            where,
            select: {
                id: true,
                dataResidency: true,
                dataClassification: true,
            },
        });

        return organizations.map((org) => ({
            id: org.id,
            dataResidency: org.dataResidency,
            dataClassification: org.dataClassification,
        }));
    }

    async listActiveMembersByOrgAndRoles(orgIds: string[], roles: OrgRoleKey[]): Promise<CronMemberRecord[]> {
        if (orgIds.length === 0 || roles.length === 0) {
            return [];
        }

        const memberships = await this.prisma.membership.findMany({
            where: {
                orgId: { in: orgIds },
                status: MembershipStatus.ACTIVE,
                role: { name: { in: roles } },
            },
            select: {
                orgId: true,
                userId: true,
                role: { select: { name: true } },
            },
        });

        return memberships.map((membership) => ({
            orgId: membership.orgId,
            userId: membership.userId,
            role: membership.role?.name && isOrgRoleKey(membership.role.name)
                ? membership.role.name
                : null,
        }));
    }
}
