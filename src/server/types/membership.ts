import type { OrgId } from './tenant';

export type MembershipRole = string;

export interface Membership {
    organizationId: OrgId;
    organizationName: string;
    roles: MembershipRole[];
}
