import type { BrandingServiceDependencies } from '@/server/services/org/branding/branding-service';
import { BrandingService } from '@/server/services/org/branding/branding-service';
import { buildBrandingServiceDependencies } from '@/server/repositories/providers/org/branding-service-dependencies';

export function buildBrandingService(overrides?: Partial<BrandingServiceDependencies>): BrandingService {
    const dependencies: BrandingServiceDependencies =
        buildBrandingServiceDependencies({ overrides });

    return new BrandingService(dependencies);
}
