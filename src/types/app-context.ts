export interface AppUserSnapshot {
    id: string;
    email?: string;
    name?: string | null;
    image?: string | null;
}

export interface AppSessionSnapshot {
    user: AppUserSnapshot;
    orgId: string;
    roleKey: string;
    dataResidency: string;
    dataClassification: string;
}

export interface AppSessionDerived {
    isAuthenticated: boolean;
    hasOrgContext: boolean;
    roleKeyNormalized: string;
    isSuperAdmin: boolean;
    isAdminLike: boolean;
}

export interface AppSessionContextValue {
    session: AppSessionSnapshot | null;
    derived: AppSessionDerived;
}

export interface OrgBrandingSnapshot {
    logoUrl?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    companyName?: string | null;
    faviconUrl?: string | null;
    customCss?: string | null;
}
