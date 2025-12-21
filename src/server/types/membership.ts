import type { OrgId } from './tenant';
import type { MembershipStatus } from '@prisma/client';

export type MembershipRole = string;

export interface Membership {
    organizationId: OrgId;
    organizationName: string;
    roles: MembershipRole[];
    status: MembershipStatus;
}
