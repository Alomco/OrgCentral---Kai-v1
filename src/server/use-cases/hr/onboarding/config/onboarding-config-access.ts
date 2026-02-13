import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { assertHrAccess } from '@/server/security/authorization/hr-guards/core';
import { type HR_ACTION, HR_PERMISSION_PROFILE, HR_RESOURCE_TYPE } from '@/server/security/authorization/hr-permissions';

export interface OnboardingConfigAccessInput {
    authorization: RepositoryAuthorizationContext;
    action: typeof HR_ACTION.LIST | typeof HR_ACTION.CREATE | typeof HR_ACTION.UPDATE;
    resourceAttributes?: Record<string, unknown>;
}

export async function assertOnboardingConfigManager(
    input: OnboardingConfigAccessInput,
): Promise<RepositoryAuthorizationContext> {
    return assertHrAccess(input.authorization, {
        action: input.action,
        resourceType: HR_RESOURCE_TYPE.ONBOARDING_TASK,
        resourceAttributes: input.resourceAttributes,
        requiredPermissions: HR_PERMISSION_PROFILE.ONBOARDING_MANAGE,
    });
}
