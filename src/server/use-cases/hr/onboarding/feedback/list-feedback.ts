import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOnboardingFeedbackRepository } from '@/server/repositories/contracts/hr/onboarding/onboarding-feedback-repository-contract';
import type { OnboardingFeedbackRecord } from '@/server/types/hr/onboarding-feedback';
import { assertOnboardingConfigManager } from '../config/onboarding-config-access';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';

export interface ListOnboardingFeedbackInput {
    authorization: RepositoryAuthorizationContext;
    employeeId?: string;
}

export interface ListOnboardingFeedbackDependencies {
    feedbackRepository: IOnboardingFeedbackRepository;
}

export interface ListOnboardingFeedbackResult {
    feedback: OnboardingFeedbackRecord[];
}

export async function listOnboardingFeedback(
    deps: ListOnboardingFeedbackDependencies,
    input: ListOnboardingFeedbackInput,
): Promise<ListOnboardingFeedbackResult> {
    await assertOnboardingConfigManager({
        authorization: input.authorization,
        action: HR_ACTION.LIST,
        resourceAttributes: { employeeId: input.employeeId ?? null },
    });
    const feedback = await deps.feedbackRepository.listFeedback(input.authorization.orgId, {
        employeeId: input.employeeId,
    });
    return { feedback };
}
