# Gap: HR offboarding flow parity

## Legacy behavior (old project)
- Offboarding could be initiated from user management with two paths:
  - direct archive/removal
  - start offboarding checklist from a template
- Offboarding employees appeared in a pending list alongside invitations.
- Employee detail page surfaced onboarding/offboarding checklists with:
  - item toggles
  - complete onboarding/offboarding actions
  - offboarding completion archived the employee.

## Current behavior (orgcentral)
- Offboarding templates can be created, but there is no initiation workflow.
- Employee detail pages can display checklist instances, but only completion of a checklist is supported.
- Termination flow exists, but does not create or link offboarding checklists.

## Gaps (new project only)
1) No UI or action to initiate offboarding for an existing employee.
2) No use-case to create an offboarding checklist instance from a template.
3) No OFFBOARDING status transition when offboarding starts.
4) Completing a checklist does not archive/remove the employee or revoke access.
5) No offboarding queue/visibility panel for in-progress offboarding employees.

---

## Objectives (orgcentral)
- Provide a consistent offboarding flow with clear entry points and permissions.
- Ensure status transitions, audit events, and access revocation are enforced.
- Make offboarding progress visible (queue + metrics) without leaking PII.
- Preserve tenant metadata: `orgId`, `dataResidency`, `dataClassification`, and audit fields.

## Assumptions & constraints
- Offboarding must be tenant-scoped and access-guarded.
- Sensitive data must not be cached unless `dataClassification === 'OFFICIAL'`.
- No secrets or PII in logs, errors, or snapshots.

## Professional needs / improvements
1) **Dual entry paths**
  - Direct archive/removal.
  - Offboarding checklist from template.
2) **Status model**
  - Add `OFFBOARDING` status and clearly defined transitions.
3) **Access lifecycle**
  - On completion: revoke access, archive employee, and trigger deprovision tasks.
4) **Queue & visibility**
  - Offboarding queue panel with counts, SLA indicators, and per-stage badges.
5) **Auditability**
  - Add explicit audit events for start, checklist creation, item completion, and closure.
6) **Permissions**
  - Role-based initiation, completion, and override actions.
7) **Resilience & rollback**
  - Allow cancellation or pause with explicit audit reason and approval.
8) **Consistency with onboarding**
  - Match checklist UX and item toggles for parity and reuse.

---

## Functional requirements
### Offboarding initiation
- Initiate from user management list and employee detail page.
- Choose path:
  - **Direct archive** (no checklist).
  - **Checklist-based** (select template, assign owner, due date).
- Permission guard: `hr:offboarding:start`.
- Must capture reason (free text + optional standardized code).

### Checklist instantiation
- Create checklist instance from template for an existing employee.
- Copy items with immutable template metadata for audit.
- Assign checklist owner and notify.

### Status transitions
- `ACTIVE` → `OFFBOARDING` on initiation.
- `OFFBOARDING` → `ARCHIVED` on completion (direct or checklist).
- Optional `OFFBOARDING` → `ACTIVE` on cancel with reason.

### Completion actions
- Archive employee record.
- Revoke access (auth, app sessions, API tokens).
- Trigger downstream deprovision tasks (directory, payroll, equipment).

### Queue & reporting
- Offboarding queue visible to HR admins.
- Filters: status, owner, due date, department, location.
- KPI tiles: total in-progress, overdue, completed last 30 days.

---

## Non-functional requirements
- Strict tenant scoping for all reads and writes.
- Data classification enforcement (no caching for non-`OFFICIAL`).
- Structured logging only; no PII.
- Accessibility: keyboard navigable, ARIA for toggles, color contrast.
- Performance: queue page should stream and use nested Suspense boundaries.

---

## Proposed data model changes
1) **Employee status**
  - Add `OFFBOARDING` to employee status enum.
2) **Offboarding record** (new)
  - `id`, `orgId`, `employeeId`, `initiatedBy`, `reason`, `status`, `startedAt`, `completedAt`, `canceledAt`.
  - Audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `dataResidency`, `dataClassification`.
3) **Checklist instance**
  - Ensure link to `offboardingId` and template metadata snapshot.

---

## Use-cases (server)
> All use-cases must enforce `assertOrgAccess` and preserve tenant metadata.

1) **Start offboarding (direct archive)**
  - Validate permissions and org scope.
  - Create `Offboarding` record.
  - Transition employee to `OFFBOARDING`.
  - Optional: immediate archive when direct path chosen.

2) **Start offboarding (checklist)**
  - Validate template availability and org scope.
  - Instantiate checklist instance with copied items.
  - Link to `Offboarding` record.
  - Transition employee to `OFFBOARDING`.

3) **Complete offboarding**
  - Require all checklist items complete (if checklist-based).
  - Archive employee, revoke access, close offboarding.

4) **Cancel offboarding**
  - Reset employee status to `ACTIVE`.
  - Mark offboarding as `CANCELED` with reason.

5) **List offboarding queue**
  - Tenant-scoped list with filters and pagination.
  - No caching if `dataClassification !== 'OFFICIAL'`.

---

## UI/UX requirements
1) **User management list**
  - Action menu: “Start offboarding”.
2) **Employee detail**
  - Offboarding section: status chip, checklist progress, CTA to complete.
3) **Offboarding queue page**
  - Table with status, due date, owner, progress bar.
  - Bulk actions (archive, reassign owner) with guard.

---

## API/service contracts
### Commands
- `startOffboarding(employeeId, mode, templateId?, reason)`
- `cancelOffboarding(offboardingId, reason)`
- `completeOffboarding(offboardingId)`
### Queries
- `getOffboardingByEmployee(employeeId)`
- `listOffboardingQueue(filters, pagination)`

---

## Audit events
- `offboarding.started`
- `offboarding.checklist.created`
- `offboarding.item.completed`
- `offboarding.completed`
- `offboarding.canceled`

---

## Security & compliance
- Enforce least-privilege actions for each stage.
- No PII in logs; include `orgId` and identifiers only.
- Store all changes with audit fields and classification metadata.

---

## Edge cases
- Employee already `OFFBOARDING` or `ARCHIVED`.
- Checklist template deleted after creation (use snapshot).
- Cancel after partial completion.
- Access revocation failures should retry and alert.

---

## Rollout plan
1) Implement server use-cases + contracts.
2) Add status enum + offboarding record.
3) Wire UI entry points (list + detail).
4) Add queue page + metrics.
5) Add audit events + revoke access pipeline.
6) QA + accessibility sweep + security review.

---

## Acceptance criteria
- Offboarding can be initiated via both entry points.
- `OFFBOARDING` status is visible and accurate.
- Checklist-based flow creates instances and links to employees.
- Completion archives employee and revokes access.
- Offboarding queue shows accurate counts and filters.
- All actions are tenant-scoped and audited.

## Implementation status (server/data)
- Use-cases: start/complete/cancel/list/get implemented with tenant guards.
- Data model: `Offboarding` record + `OffboardingStatus` enum added; missing owner/due-date fields and `offboardingId` link on checklist instances.
- Audit events: `hr.offboarding.started`, `hr.offboarding.completed`, `hr.offboarding.canceled` implemented; checklist-created and item-completed events missing.
- Access lifecycle: `employmentStatus` transitions + session invalidation + membership suspension implemented; downstream deprovision tasks not wired.

## Remaining TODOs
- [ ] Add checklist instance link back to `offboardingId` and snapshot metadata.
- [ ] Capture owner + due date for offboarding and expose queue filters.
- [ ] Emit audit events for checklist creation and item completion.
- [ ] Auto-complete offboarding on checklist completion (or document manual requirement).
- [ ] Add downstream deprovision tasks (directory, payroll, equipment).
- [ ] Scrub or avoid free-text reasons in audit payloads to prevent PII leakage.

## Security & A11y verification checklist
- [x] Guarded by `assertOffboarding*` permissions on all use-cases.
- [x] Tenant-scoped access enforced via `orgId` in every repository call.       
- [x] Session invalidation + membership suspension executed with retries.       
- [ ] No PII in structured logs or error payloads (free-text reasons are logged today).
- [x] Queue UI uses accessible labels, keyboard-friendly controls, and status badges.
- [x] Progress indicators use semantic UI (`Progress`) and textual equivalents.
