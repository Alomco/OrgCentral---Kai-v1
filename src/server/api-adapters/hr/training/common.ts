import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import {
    defaultTrainingServiceProvider,
    type TrainingServiceContract,
} from '@/server/services/hr/training/training-service.provider';

export const TRAINING_RESOURCE = 'hr.training-record';

export interface ResolvedTrainingControllerDependencies {
    session: GetSessionDependencies;
    service: TrainingServiceContract;
}

export type TrainingControllerDependencies = Partial<ResolvedTrainingControllerDependencies>;

export const defaultTrainingControllerDependencies: ResolvedTrainingControllerDependencies = {
    session: {},
    service: defaultTrainingServiceProvider.service,
};

export function resolveTrainingControllerDependencies(
    overrides?: TrainingControllerDependencies,
): ResolvedTrainingControllerDependencies {
    if (!overrides) {
        return defaultTrainingControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultTrainingControllerDependencies.session,
        service: overrides.service ?? defaultTrainingControllerDependencies.service,
    };
}
