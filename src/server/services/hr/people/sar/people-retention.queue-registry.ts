import type { BullMqRetentionQueueOptions, RetentionQueueClient } from './people-retention.queue';
import { createBullMqRetentionQueueClient } from './people-retention.queue';

let client: RetentionQueueClient | null = null;

function resolveOptions(overrides?: BullMqRetentionQueueOptions): BullMqRetentionQueueOptions {
  return {
    queueName: overrides?.queueName ?? 'hr-people-retention',
    connection: overrides?.connection,
    defaultJobOptions: overrides?.defaultJobOptions,
  };
}

export function getRetentionQueueClient(
  options?: BullMqRetentionQueueOptions,
): RetentionQueueClient {
  client ??= createBullMqRetentionQueueClient(resolveOptions(options));
  return client;
}
