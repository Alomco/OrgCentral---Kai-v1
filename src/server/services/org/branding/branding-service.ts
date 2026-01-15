import type { IBrandingRepository } from '@/server/repositories/contracts/org/branding/branding-repository-contract';
import type { IPlatformBrandingRepository } from '@/server/repositories/contracts/platform/branding/platform-branding-repository-contract';
import type { BrandingServiceDependencies } from '@/server/repositories/contracts/org/branding/branding-service-dependencies';
import type { OrgBranding, PlatformBranding } from '@/server/types/branding-types';

export type { BrandingServiceDependencies };

export class BrandingService {
    private readonly orgBrandingRepository: IBrandingRepository;
    private readonly platformBrandingRepository: IPlatformBrandingRepository;

    constructor(dependencies: BrandingServiceDependencies) {
        this.orgBrandingRepository = dependencies.orgBrandingRepository;
        this.platformBrandingRepository = dependencies.platformBrandingRepository;
    }

    getOrgBranding(orgId: string): Promise<OrgBranding | null> {
        return this.orgBrandingRepository.getBranding(orgId);
    }

    getPlatformBranding(): Promise<PlatformBranding | null> {
        return this.platformBrandingRepository.getBranding();
    }
}
