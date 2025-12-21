import { PrismaTrainingRecordRepository } from '@/server/repositories/prisma/hr/training';
import { TrainingService, type TrainingServiceDependencies } from './training-service';

const trainingRepository = new PrismaTrainingRecordRepository();

const defaultTrainingServiceDependencies: TrainingServiceDependencies = {
    trainingRepository,
};

const sharedTrainingService = new TrainingService(defaultTrainingServiceDependencies);

export function getTrainingService(
    overrides?: Partial<TrainingServiceDependencies>,
): TrainingService {
    if (!overrides || Object.keys(overrides).length === 0) {
        return sharedTrainingService;
    }

    return new TrainingService({
        ...defaultTrainingServiceDependencies,
        ...overrides,
    });
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
