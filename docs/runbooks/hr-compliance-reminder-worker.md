# HR Compliance Reminder Worker

- **Queue/Worker**: `hr-compliance-reminder` queue with job name `hr.compliance.reminder`, processed by `ComplianceReminderWorker` (`src/server/workers/hr/compliance/reminder.worker.ts`).
- **Purpose**: Iterate compliance log items approaching expiry and send personalized notifications before evidence deadlines lapse, replacing the legacy Firebase `checkComplianceExpiries` cron.
- **Payload schema** (`ComplianceReminderEnvelope`):
  - `orgId`: tenant scope of the job.
  - `payload.referenceDate` (optional `Date`): defaults to current UTC time.
  - `payload.daysUntilExpiry` (`number`, default `30`): window for fetching expiring tasks.
  - `payload.targetUserIds` (`string[]`, optional): limit reminders to a subset of employees.
  - `authorization`: Better Auth guard context (service user id, expected residency/classification, required roles `['orgAdmin','compliance']`).
  - `metadata.cacheScopes`: always includes `hr:compliance` to assist cache invalidations.
- **Scheduling**: Use `scheduleComplianceReminderJob` in `src/server/workers/hr/compliance/reminder.scheduler.ts`.
  - Default cron: `0 1 * * *` (01:00 Europe/London), job id `hr-compliance-reminder:<orgId>`.
  - Custom intervals supported via `RepeatExpression` (`cron` or `every` syntax like `12h`).
  - Unscheduling helper `unscheduleComplianceReminderJob` removes repeatable jobs when tenants disable reminders.
- **Processing flow** (`ComplianceReminderProcessor`):
  1. Fetch expiring compliance items via `findExpiringItemsForOrg` on `IComplianceItemRepository`.
  2. Filter optional `targetUserIds`, bucket items per employee, rank by nearest due date.
  3. Emit HR notifications (type `compliance-reminder`) through `HrNotificationService`, tagging residency/classification + item metadata for audit trails.
  4. Prioritize urgency (`urgent` ≤1 day, `high` ≤3 days, else `medium`).
- **Cache & audit**: Worker metadata includes `hr:compliance` cache scope; notifications inherit org classification/residency from the authorization context so auditors can trace reminder fan-out. Update compliance runbooks if notification templates change.
- **Validation**: `pnpm exec vitest run src/server/workers/hr/compliance/__tests__/reminder.processor.test.ts` exercises grouping, prioritization, and targeting behaviour. Ensure `pnpm exec tsc --noEmit` remains clean before deploying.
