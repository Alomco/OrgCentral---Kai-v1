import { Queue, type JobsOptions, type QueueOptions } from 'bullmq';
import type { RetentionJobQueue } from './people-retention-scheduler';

export interface BullMqRetentionQueueOptions {
  queueName?: string;
  connection?: QueueOptions['connection'];
  defaultJobOptions?: JobsOptions;
}

export interface RetentionQueueClient {
  queue: Queue;
  jobQueue: RetentionJobQueue;
}

const defaultConnectionUrl =
  process.env.BULLMQ_REDIS_URL ?? process.env.REDIS_URL ?? 'redis://localhost:6379';

export function createBullMqRetentionQueueClient(
  options: BullMqRetentionQueueOptions = {},
): RetentionQueueClient {
  const queueName = options.queueName ?? 'hr-people-retention';
  const queue = new Queue(queueName, {
    connection: options.connection ?? { url: defaultConnectionUrl },
    defaultJobOptions: options.defaultJobOptions,
  });

  const jobQueue: RetentionJobQueue = {
    async enqueueProfileSoftDelete(job) {
      await queue.add('profile.softDelete', job);
    },
    async enqueueContractSoftDelete(job) {
      await queue.add('contract.softDelete', job);
    },
  };

  return { queue, jobQueue };
}

export function createBullMqRetentionQueue(options?: BullMqRetentionQueueOptions): RetentionJobQueue {
  return createBullMqRetentionQueueClient(options).jobQueue;
}
