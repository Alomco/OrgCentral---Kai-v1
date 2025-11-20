export interface DepartmentFilters {
    orgId?: string;
    businessUnit?: string;
    costCenter?: string;
}

export interface DepartmentCreationData {
    orgId: string;
    name: string;
    path?: string;
    leaderOrgId?: string;
    leaderUserId?: string;
    businessUnit?: string;
    costCenter?: string;
}

export interface DepartmentUpdateData {
    name?: string;
    path?: string;
    leaderOrgId?: string;
    leaderUserId?: string;
    businessUnit?: string;
    costCenter?: string;
}
