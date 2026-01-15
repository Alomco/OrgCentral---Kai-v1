import { createSecurityEventRepository } from '@/server/repositories/providers/auth/security-event-repository-provider';
import { buildOrganizationServiceDependencies } from '@/server/repositories/providers/org/organization-service-dependencies';
import type { ISecurityEventRepository } from '@/server/repositories/contracts/auth/security/security-event-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';

export interface SecurityEventServiceDependencies {
    securityEventRepository: ISecurityEventRepository;
    organizationRepository: IOrganizationRepository;
}

export function buildSecurityEventServiceDependencies(): SecurityEventServiceDependencies {
    const securityEventRepository = createSecurityEventRepository();
    const { organizationRepository } = buildOrganizationServiceDependencies();

    return {
        securityEventRepository,
        organizationRepository,
    };
}
