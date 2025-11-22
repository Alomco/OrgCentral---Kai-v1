import type { PlatformBranding } from '@/server/types/branding-types';

export interface IPlatformBrandingRepository {
    getBranding(): Promise<PlatformBranding | null>;
    updateBranding(updates: Partial<PlatformBranding>): Promise<PlatformBranding>;
    resetBranding(): Promise<void>;
}
