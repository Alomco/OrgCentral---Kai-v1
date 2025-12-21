import type { JobsOptions } from 'bullmq';
import { WORKER_QUEUE_NAMES } from '@/server/workers/constants';
import { getQueue, type QueueRegistryOptions } from '@/server/workers/config/queue-registry';
import { TRAINING_REMINDER_JOB_NAME, type TrainingReminderEnvelope } from './reminder.types';

export interface TrainingReminderQueueClient {
    enqueueReminderJob(envelope: TrainingReminderEnvelope, options?: JobsOptions): Promise<void>;
}

export function getTrainingReminderQueueClient(
    options?: QueueRegistryOptions,
): TrainingReminderQueueClient {
    const queue = getQueue(WORKER_QUEUE_NAMES.HR_TRAINING_REMINDER, options);
    return {
        async enqueueReminderJob(envelope, jobOptions) {
            await queue.add(TRAINING_REMINDER_JOB_NAME, envelope, {
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: 'exponential', delay: 1_000 },
                ...jobOptions,
            });
        },
    };
}
