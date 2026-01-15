import type { IPlatformProvisioningRepository } from '@/server/repositories/contracts/platform';
import { buildPlatformProvisioningServiceDependencies } from '@/server/repositories/providers/platform/platform-provisioning-service-dependencies';

export interface DebugOrgSummary {
    id: string;
    slug: string;
    name: string;
}

export interface DebugSecurityDependencies {
    provisioningRepository: IPlatformProvisioningRepository;
}

export type DebugSecurityOverrides = Partial<DebugSecurityDependencies>;

export async function listSessionOrganizations(
    userId: string,
    overrides: DebugSecurityOverrides = {},
): Promise<DebugOrgSummary[]> {
    const repository =
        overrides.provisioningRepository ??
        buildPlatformProvisioningServiceDependencies().provisioningRepository;
    const organizations = await repository.listUserOrganizations(userId, 15);

    return organizations.map(({ id, slug, name }) => ({ id, slug, name }));
}
