import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOnboardingMetricDefinitionRepository } from '@/server/repositories/contracts/hr/onboarding/onboarding-metric-repository-contract';
import type { OnboardingMetricDefinitionRecord } from '@/server/types/hr/onboarding-metrics';
import { assertOnboardingConfigManager } from '../config/onboarding-config-access';
import { HR_ACTION } from '@/server/security/authorization/hr-permissions/actions';

export interface UpdateMetricDefinitionInput {
    authorization: RepositoryAuthorizationContext;
    definitionId: string;
    updates: {
        label?: string;
        unit?: string | null;
        targetValue?: number | null;
        isActive?: boolean;
    };
}

export interface UpdateMetricDefinitionDependencies {
    definitionRepository: IOnboardingMetricDefinitionRepository;
}

export interface UpdateMetricDefinitionResult {
    definition: OnboardingMetricDefinitionRecord;
}

export async function updateMetricDefinition(
    deps: UpdateMetricDefinitionDependencies,
    input: UpdateMetricDefinitionInput,
): Promise<UpdateMetricDefinitionResult> {
    await assertOnboardingConfigManager({
        authorization: input.authorization,
        action: HR_ACTION.UPDATE,
        resourceAttributes: { definitionId: input.definitionId },
    });

    const definition = await deps.definitionRepository.updateDefinition(
        input.authorization.orgId,
        input.definitionId,
        {
            label: input.updates.label?.trim(),
            unit: input.updates.unit ?? undefined,
            targetValue: input.updates.targetValue ?? undefined,
            isActive: input.updates.isActive,
            updatedBy: input.authorization.userId,
        },
    );

    return { definition };
}
