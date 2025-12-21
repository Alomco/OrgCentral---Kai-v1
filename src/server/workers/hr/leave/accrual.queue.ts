import type { JobsOptions } from 'bullmq';
import { WORKER_QUEUE_NAMES } from '@/server/workers/constants';
import { getQueue, type QueueRegistryOptions } from '@/server/workers/config/queue-registry';
import { LEAVE_ACCRUAL_JOB_NAME, type LeaveAccrualEnvelope } from './accrual.types';

export interface LeaveAccrualQueueClient {
    enqueueAccrualJob(envelope: LeaveAccrualEnvelope, options?: JobsOptions): Promise<void>;
}

export function getLeaveAccrualQueueClient(
    options?: QueueRegistryOptions,
): LeaveAccrualQueueClient {
    const queue = getQueue(WORKER_QUEUE_NAMES.HR_LEAVE_ACCRUAL, options);
    return {
        async enqueueAccrualJob(envelope, jobOptions) {
            await queue.add(LEAVE_ACCRUAL_JOB_NAME, envelope, {
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: 'exponential', delay: 1_000 },
                ...jobOptions,
            });
        },
    };
}
