import type { IPlatformBrandingRepository } from '@/server/repositories/contracts/platform/branding/platform-branding-repository-contract';
import type { IBrandingRepository } from '@/server/repositories/contracts/org/branding/branding-repository-contract';

export interface BrandingServiceDependencies {
    orgBrandingRepository: IBrandingRepository;
    platformBrandingRepository: IPlatformBrandingRepository;
}
