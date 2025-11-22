import type { OrgBranding } from '@/server/types/branding-types';

export interface IBrandingRepository {
    getBranding(orgId: string): Promise<OrgBranding | null>;
    updateBranding(orgId: string, updates: Partial<OrgBranding>): Promise<OrgBranding>;
    resetBranding(orgId: string): Promise<void>;
}
