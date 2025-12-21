# HR Training Reminder Worker

- **Queue/Worker**: `hr-training-reminder` queue with job name `hr.training.reminder`, processed by `TrainingReminderWorker` (`src/server/workers/hr/training/reminder.worker.ts`).
- **Purpose**: Notify users about training that is expiring soon or already overdue (uses expiryDate on training records). Mirrors the compliance reminder flow but scoped to training records.
- **Payload schema** (`TrainingReminderEnvelope`):
  - `orgId`: tenant scope of the job.
  - `payload.referenceDate` (optional `Date`): defaults to current UTC time.
  - `payload.daysUntilExpiry` (`number`, default `30`): window for fetching expiring training.
  - `payload.includeOverdue` (`boolean`, default `true`): whether to also notify for already-expired training.
  - `payload.targetUserIds` (`string[]`, optional): limit reminders to selected employees.
  - `authorization`: Better Auth guard context (service user id, expected residency/classification, required roles `['orgAdmin','compliance']`).
  - `metadata.cacheScopes`: includes `hr:training` to assist cache invalidations.
- **Scheduling helpers**: `scheduleTrainingReminderJob` / `unscheduleTrainingReminderJob` in `src/server/workers/hr/training/reminder.scheduler.ts`.
  - Default cron: `0 2 * * *` (02:00 Europe/London), job id `hr-training-reminder:<orgId>`.
  - Custom intervals supported via `RepeatExpression` (`cron` or `every` syntax like `12h`).
  - Queue client: `getTrainingReminderQueueClient` in `src/server/workers/hr/training/reminder.queue.ts`.
- **Processing flow** (`TrainingReminderProcessor`):
  1. Fetch training records with `expiryDate` inside the window (and overdue when enabled), optionally filtered to target users.
  2. Emit HR notifications (`training-due`, `training-overdue`) via `HrNotificationService`, tagging residency/classification and record metadata for audit trails.
  3. Tracks reminders sent and users targeted for observability.
- **Production cron wiring**:
  1. Ensure `CRON_SECRET` is set in the environment (shared with other cron endpoints).
  2. Schedule a daily GET to `/api/cron/training-reminders` at `0 2 * * *` Europe/London with header `x-cron-secret: $CRON_SECRET`. Example curl:
     ```bash
     curl -H "x-cron-secret: $CRON_SECRET" \
          "https://<app-host>/api/cron/training-reminders"
     ```
  3. Optional query params: `daysUntilExpiry=45`, `includeOverdue=false`, `userId=<uuid>` (repeatable), `referenceDate=2025-12-18`.
  4. Worker must be running (BullMQ) with access to the same Redis used by the queue registry.
- **Validation**: Keep `pnpm tsc --noEmit` clean. If you add templates or alter notification payloads, update `notification-template-registry` as needed.
