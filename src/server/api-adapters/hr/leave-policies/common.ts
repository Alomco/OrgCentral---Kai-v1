import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import {
    defaultLeavePolicyServiceProvider,
    type LeavePolicyServiceContract,
} from '@/server/services/hr/leave-policies/leave-policy-service.provider';
import { HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

export const HR_LEAVE_POLICY_RESOURCE_POLICY = HR_RESOURCE.HR_LEAVE_POLICY;

export interface ResolvedLeavePolicyControllerDependencies {
    session: GetSessionDependencies;
    service: LeavePolicyServiceContract;
}

export type LeavePolicyControllerDependencies = Partial<ResolvedLeavePolicyControllerDependencies>;

export const defaultLeavePolicyControllerDependencies: ResolvedLeavePolicyControllerDependencies = {
    session: {},
    service: defaultLeavePolicyServiceProvider.service,
};

export function resolveLeavePolicyControllerDependencies(
    overrides?: LeavePolicyControllerDependencies,
): ResolvedLeavePolicyControllerDependencies {
    if (!overrides) {
        return defaultLeavePolicyControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultLeavePolicyControllerDependencies.session,
        service: overrides.service ?? defaultLeavePolicyControllerDependencies.service,
    };
}
