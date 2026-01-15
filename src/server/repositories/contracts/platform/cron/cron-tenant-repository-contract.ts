import type { OrgRoleKey } from '@/server/security/access-control';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface CronOrgRecord {
    id: string;
    dataResidency: DataResidencyZone;
    dataClassification: DataClassificationLevel;
}

export interface CronMemberRecord {
    orgId: string;
    userId: string;
    role: OrgRoleKey | null;
}

export interface ICronTenantRepository {
    listActiveOrganizations(orgIds?: string[]): Promise<CronOrgRecord[]>;
    listActiveMembersByOrgAndRoles(orgIds: string[], roles: OrgRoleKey[]): Promise<CronMemberRecord[]>;
}
