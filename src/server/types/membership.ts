import type { OrgId } from './tenant';
import type { MembershipStatus } from '@/server/types/prisma';

export type MembershipRole = string;

export interface Membership {
    organizationId: OrgId;
    organizationName: string;
    roles: MembershipRole[];
    status: MembershipStatus;
}

export interface MembershipRecord {
    orgId: OrgId;
    userId: string;
    status: MembershipStatus;
    org?: { name?: string | null } | null;
    role?: { name?: string | null } | null;
}
