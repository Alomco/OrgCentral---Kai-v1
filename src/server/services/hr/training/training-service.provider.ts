import { TrainingService, type TrainingServiceDependencies } from './training-service';
import { buildTrainingServiceDependencies, type TrainingServiceDependencyOptions } from '@/server/repositories/providers/hr/training-service-dependencies';

const sharedTrainingService = (() => {
    const dependencies = buildTrainingServiceDependencies();
    return new TrainingService(dependencies);
})();

export function getTrainingService(
    overrides?: Partial<TrainingServiceDependencies>,
    options?: TrainingServiceDependencyOptions,
): TrainingService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedTrainingService;
    }

    const dependencies = buildTrainingServiceDependencies({
        prismaOptions: options?.prismaOptions,
        overrides,
    });

    return new TrainingService(dependencies);
}

export type TrainingServiceContract = Pick<
    TrainingService,
    | 'listTrainingRecords'
    | 'getTrainingRecord'
    | 'enrollTraining'
    | 'updateTrainingRecord'
    | 'completeTraining'
    | 'deleteTrainingRecord'
>;

export interface TrainingServiceProvider {
    service: TrainingServiceContract;
}

export const defaultTrainingServiceProvider: TrainingServiceProvider = {
    service: getTrainingService(),
};
