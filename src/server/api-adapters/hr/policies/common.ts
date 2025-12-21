import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import {
    defaultHrPolicyServiceProvider,
    type HrPolicyServiceContract,
} from '@/server/services/hr/policies/hr-policy-service.provider';
import { HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export const HR_POLICY_RESOURCE_POLICY = HR_RESOURCE.HR_POLICY;

export interface ResolvedHrPolicyControllerDependencies {
    session: GetSessionDependencies;
    service: HrPolicyServiceContract;
}

export type HrPolicyControllerDependencies = Partial<ResolvedHrPolicyControllerDependencies>;

export const defaultHrPolicyControllerDependencies: ResolvedHrPolicyControllerDependencies = {
    session: {},
    service: defaultHrPolicyServiceProvider.service,
};

export function resolveHrPolicyControllerDependencies(
    overrides?: HrPolicyControllerDependencies,
): ResolvedHrPolicyControllerDependencies {
    if (!overrides) {
        return defaultHrPolicyControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultHrPolicyControllerDependencies.session,
        service: overrides.service ?? defaultHrPolicyControllerDependencies.service,
    };
}
