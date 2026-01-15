import { buildOrganizationServiceDependencies } from '@/server/repositories/providers/org/organization-service-dependencies';
import { getLeaveSettings as getLeaveSettingsUseCase } from '@/server/use-cases/org/organization/get-leave-settings';
import { updateLeaveSettings as updateLeaveSettingsUseCase } from '@/server/use-cases/org/organization/update-leave-settings';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

export async function fetchLeaveSettings(
    authorization: RepositoryAuthorizationContext,
    orgId: string,
) {
    const { organizationRepository } = buildOrganizationServiceDependencies();
    return getLeaveSettingsUseCase({ organizationRepository }, { authorization, orgId });
}

export async function saveLeaveSettings(
    authorization: RepositoryAuthorizationContext,
    orgId: string,
    updates: Record<string, unknown>,
) {
    const { organizationRepository } = buildOrganizationServiceDependencies();
    return updateLeaveSettingsUseCase({ organizationRepository }, { authorization, orgId, updates });
}