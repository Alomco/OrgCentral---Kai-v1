# HR Use-Case Architecture

This guide tells AI agents how to explore and extend the HR domain without duplicating effort. Follow it whenever you add or refactor logic inside `src/server/use-cases/hr`.

## Goals

- Reuse existing repositories, services, and cache helpers instead of rebuilding primitives.
- Keep every file under 250 LOC and follow the contracts/mappers/prisma layering described in `docs/backend-migration-plan.md`.
- Surface unfinished legacy behavior from `old/` and ensure parity before shipping new HR modules.
- Bake in SOLID, zero-trust, and UK gov (DSPT/Cabinet Office) controls so every HR feature remains auditable and multi-tenant safe.

## Centralization Guardrails

- **Single Source of Truth** – Services own orchestration, repositories own persistence, domain helpers own calculations. Extend these layers instead of duplicating logic in controllers or actions.
- **Generic, Typed Helpers** – Prefer reusable functions with explicit generics (e.g., `async function runHrMutation<TResult>(...)`) to share behavior without leaking `any`.
- **Compliance-Ready Defaults** – Always propagate `orgId`, residency, classification, audit metadata, and cache tags. Treat cache scopes as classification boundaries.
- **Library-First Implementations** – Use vetted packages already installed (`zod` for validation, `BullMQ` for workers, Resend/Novu adapters, etc.) before authoring custom utilities.
- **Scalable Patterns** – Expect new tenants, regions, and policies. Keep business rules configuration-driven and store defaults centrally (`src/config`).

## Architecture Principles

- **Repository Pattern First** – Define interfaces inside `src/server/repositories/contracts/hr`, map DTOs under `mappers/hr`, then implement in `repositories/prisma/hr`. Depend on contracts, never implementations, within `use-cases`.
- **Service-Centric Logic** – Every business rule belongs in a class extending `AbstractHrService`; keep route handlers/server actions as thin orchestration layers that simply call services.
- **SOLID & Reuse** – Keep classes/functions single-purpose, inject dependencies (DIP), and expose extension points via interfaces so modules scale without rewrites.
- **Tenant & Compliance Awareness** – Pass `orgId`, residency, and classification through every method. Respect cache tags (`buildCacheTag`) that encode these fields to avoid cross-tenant bleed and uphold UK gov baselines.
- **Observability Everywhere** – Wrap work inside `executeInServiceContext`, log via `StructuredLogger`, and add cache invalidation hooks so OTEL traces line up with data mutations.
- **Docs as Source** – Treat `docs/backend-migration-plan.md`, `docs/requirements/**`, and `docs/runbooks/**` as canonical references. Update them when behavior changes.
- **Maximum Modularity** – Keep modules single-purpose, expose shared helpers via index files, and prefer composition over inheritance so other HR flows can import capabilities without forking code paths.
- **Scalability Mindset** – Assume new tenants, regions, and HR policies will arrive; design extension points (feature flags, config-driven validations) so future AI agents plug in behavior without editing core primitives.
- **Portable Building Blocks** – Publish multi-purpose utilities that frontend, services, and workers can consume without diverging behavior.
## Directory Orientation

| Folder | Purpose | Notes |
| --- | --- | --- |
| `absences/`, `leave/`, `time-tracking/` | Current HR domain modules | Prefer extending these before adding new siblings. |
| `notifications/`, `people/`, `performance/`, `training/`, `policies/`, `settings/` | Adjacent modules with reusable helpers | Inspect exports before inventing new DTOs or validators. |
| `src/server/repositories/**` | Contracts + Prisma implementations | Always import contracts, not concrete classes, in use-cases. |
| `src/server/services/**` | Service layer enforcing guards/logging | Derive new services from `AbstractHrService`. |
| `docs/` + `old/` | Legacy reference + migration notes | Use to find missing functionality or compliance rules (see workflow below). |

## Module Coverage & Readiness

| Module | Primary Folder(s) | Current Status | Next Steps |
| --- | --- | --- | --- |
| Absences | `use-cases/hr/absences`, `domain/absences`, `services/hr/absences` | Service + domain layers exist; controllers route through `AbsenceService` | Extend the centralized service/domain helpers rather than creating standalone flows. |
| Leave Balances & Settings | `use-cases/hr/leave`, `domain/leave`, `services/hr/leave` | `LeaveService` now wraps submit/approve/reject/cancel/balance operations with `executeInServiceContext`, cache helpers live under `use-cases/hr/leave/shared/cache-helpers.ts`, and decision notifications/ balance reconciliation match the Firebase legacy logic. | Next: add automated accrual + backfill jobs and extend service tests to cover reconciliation + notification fallbacks. |
| Notifications | `use-cases/hr/notifications` | Service + repo live; emitter helper available | Use `notification-emitter.ts` (service-backed) for cross-module events; ensure cache tags are registered/invalidated. |
| People Directory | `use-cases/hr/people` | Not yet modernized | Mirror legacy `old/src/lib/people` flows; centralize profile enrichment in a domain helper. |
| Performance | `use-cases/hr/performance` | Placeholder | Define evaluation repository contracts first, then create service entry points for review cycles and feedback. |
| Policies | `use-cases/hr/policies`, `services/hr/policies`, `api-adapters/hr/policies`, `app/api/hr/policies` | Service + API surface implemented | Maintain parity with legacy acknowledgement rules and ensure policy change + acknowledgement notifications remain tenant-scoped and cache-safe. |
| Training | `use-cases/hr/training` | Pending | Align with `old/docs/qwen_cp_mix/training` before adding modules. |
| Settings | `use-cases/hr/settings` | Only absence settings implemented | Expand to cover approval workflows + telemetry toggles; keep config storage in Prisma metadata columns. |
| Time Tracking | `use-cases/hr/time-tracking` | Partial (reporting + return-to-work) | Confirm `time entry` domain models line up with `old/firebase/time` data before extending. |

Keep this table up-to-date whenever a module gains a service, repository, or API surface so future contributors can see what is safe to reuse.

## Current Absence Use-Cases Snapshot

| Feature | Entry Points | Notes |
| --- | --- | --- |
| Unplanned absence acknowledgement | `absences/acknowledge-unplanned-absence.ts` | Uses `normalizeString`, writes acknowledgement metadata, and invalidates scoped cache via `invalidateAbsenceScopeCache`. Reuse this pattern instead of creating new metadata writers. |
| Unplanned absence cancellation | `absences/cancel-unplanned-absence.ts` | Handles leave balance reversal plus metadata trail. Extend this when adding new cancellation states instead of duplicating repository calls. |
| Absence settings update | `absences/update-absence-settings.ts` | Centralizes validation + cache invalidation for tenant hours/rounding settings. Future settings mutations should funnel through this use case. |
| Absence attachment AI analysis (Gemini) | `absences/analyze-absence-attachment.ts` + `lib/ai/gemini-document-validator.ts` | Downloads attachments, calls Gemini, and stores validation metadata. New AI validators must hook into this pipeline rather than rolling their own fetchers. |

Documenting these ensures future modules don’t re-implement the same behavior.

## Centralization Backlog (Absences)

1. **Absence Service Layer** – ✅ `src/server/services/hr/absences/absence-service.ts` now wraps reads (list), mutations (report, approve, update, delete, attachments, return-to-work), settings, acknowledgement, cancellation, and AI validation flows. Future work must extend this service (instead of controller-specific logic) so `executeInServiceContext`, audit metadata, cache invalidation, and guard checks stay consistent.

2. **Domain Modules** – ✅ Core helpers live under `src/server/domain/absences/**` (metadata, time-calculations, conversions, attachments). Reuse these modules instead of importing from historical `use-cases/.../utils`. If you need new helpers (e.g., balance reconciliation), add another file in the same folder and re-export it via the domain index.

3. **Domain-Specific Errors** – ✅ `src/server/errors/hr-absences.ts` now exposes `AbsenceAlreadyClosedError`, `AbsenceAnalysisInProgressError`, and attachment-specific errors. Controllers should translate these codes to HTTP responses via the shared error response helper.

4. **Cache Strategy Registry** – ✅ `src/server/lib/cache-tags/hr-absences.ts` centralizes absence cache scopes (absences, leave balances, AI validation). Use `resolveAbsenceCacheScopes` or the helper functions in `absences/cache-helpers.ts` rather than sprinkling cache keys.

5. **Migration Tracking** – Track remaining gaps (async workers, analytics, cross-tenant reports) here so future efforts plug into the centralized service/domain stack instead of inventing new entry points.

## API Adapter, Service, and Repository Expectations

- **API Adapters (`src/server/api-adapters/hr/**`)** – Each adapter should:
	- Accept a fully formed `RepositoryAuthorizationContext` (from session helpers) and pass it to services.
	- Never touch Prisma or repositories directly; call the relevant service method and map the result to HTTP response DTOs.
	- Translate known domain errors (e.g., `AbsenceAlreadyClosedError`) to HTTP status codes using a single helper (add one if missing).

- **Service Layer (`src/server/services/hr/**`)** – For every module listed above, provide a service that:
	- Extends `AbstractHrService` to inherit logging, telemetry, and guard helpers.
	- Accepts all repositories via constructor injection; no `import` of Prisma clients inside service methods.
	- Wraps public operations with `this.executeInServiceContext('operationName', async () => { ... })` and logs key events via `this.logger.withFields`. 
	- Centralizes cache invalidation via helper utilities so the API layer does not repeat cache logic.

## HR Policies (Implementation Notes)

- **Entry points**: REST routes under `src/app/api/hr/policies/**/route.ts` delegate to controllers in `src/server/api-adapters/hr/policies/**`.
- **Validation**: HR policy request schemas live with the module and are imported by API adapters (for example `src/server/services/hr/policies/hr-policy-schemas.ts`).
- **Notifications**:
	- Policy create/update emits an HR notification of type `policy-update` to active employees in the same organization (excluding the actor).
	- Policy acknowledgement emits an HR notification to the acknowledging user (represented via `metadata.event = 'acknowledged'`).
	- Recipient targeting must always be derived from org-scoped repositories (for example employee profiles filtered by `orgId` and `employmentStatus: 'ACTIVE'`) to prevent cross-tenant fan-out.

- **Repositories & Mappers** – When introducing new data access patterns:
	- Add contracts under `src/server/repositories/contracts/hr/<module>/*.ts` with type-only imports for DTOs.
	- Implement Prisma repositories under `src/server/repositories/prisma/hr/<module>/*.ts`, extending `BasePrismaRepository` for consistent tenant scoping and telemetry.
	- Place DTO converters inside `src/server/repositories/mappers/hr/<module>/*.ts` so services never depend on Prisma models.

## Auth & Security Integration

- Always generate authorization contexts via `getSessionContext` helpers before calling services. The context must include `orgId`, `userId`, roles, residency, and classification.
- Use guard helpers from `src/server/security/authorization.ts` and `src/server/security/guards.ts`:
	- `assertOrgAccess` for read operations.
	- `assertPrivilegedOrgAbsenceActor` / module-specific guards for mutations.
- When building new modules, add domain-specific guard helpers rather than sprinkling role checks around the code. Example: `assertHrPolicyEditor` for policies.
- Respect cache tags that encode classification/residency. Register tags during reads with `registerCacheTag` and invalidate via `invalidateOrgCache` or the module helper after writes.
- Treat every repository/service hop as zero-trust: enforce RBAC + ABAC + residency/classification gates so the solution stays aligned with UK government DSPT requirements.

## Shared Package Guidance

- **Validation (`zod`)** – Define request/response schemas with `zod` under `src/server/types/**`. Reuse shared schemas when possible to keep DTOs type-safe and prevent drift between services and UI.
- **Queues (`BullMQ`)** – Background processing must use the BullMQ wrappers and queue registries under `src/server/lib/queues/**`. Inject queue clients into services so tenancy metadata, audit scopes, and retries stay centralized.
- **Storage & Attachments** – Reuse `src/server/lib/storage/*` helpers (HTTP downloader, storage clients) instead of re-implementing fetch logic in each module.
- **AI Integrations** – All HR AI features should share `src/server/lib/ai/*` helpers. Add new validators next to the Gemini implementation and reuse the normalization helpers.
- **Telemetry & Logging** – Import `StructuredLogger` from `src/server/logging/structured-logger.ts` and the OTEL utilities from `src/server/telemetry/**`. Do not add raw `console.log` statements.
- **Config** – Keep feature flags and module configuration in `src/config/**` so both services and front-end can share the source of truth.

Whenever a new helper package is introduced, document it here plus in the relevant module README so AI agents know where to find it.

## Reuse Playbook

1. **Inventory** – Read `docs/migration-task-breakdown.md` plus the relevant `docs/requirements/hr-*` file and `old/docs/qwen_cp_mix/**` section to restate the business intent in modern terms.
2. **Survey Existing Modules** – Inspect sibling folders for similar DTOs/services before writing anything. Re-export helpers when possible.
3. **Map Contracts** – Locate repository interfaces in `src/server/repositories/contracts/hr`. If a method is absent, add it there first, wire the Prisma implementation, then surface helpers in services.
4. **Services Before Actions** – Implement business logic inside service classes that extend `AbstractHrService`, then call those services from route handlers or server actions. Shared logic should live in typed helpers/generics so other modules can reuse them without copying code.
5. **Cache Discipline** – Fetchers must call `registerCacheTag`; mutations must invalidate via helpers in `src/server/lib/cache-tags.ts`.
6. **Telemetry & Guards** – Wrap public service methods with `executeInServiceContext` and enforce org access via `assertOrgAccess` before touching repositories.

## Deep Analysis Workflow

1. **Legacy Crawl** – Search `old/src` and `old/docs/requirements` for the exact feature (e.g., `"return to work"`). Note data models, validation rules, and side effects.
2. **Manifest Cross-Check** – Use `docs/backend-function-manifest.json` to confirm whether the feature already has a modern placeholder. If it does, extend it instead of duplicating logic.
3. **Gap Registration** – When no modern equivalent exists, add a TODO in the target module README (or create one) citing the legacy file path and summarizing missing scopes.
4. **Dependency Trace** – Identify existing repositories/services used in adjacent modules; prefer composition over new Prisma queries. If an old feature used Firebase, check `docs/backend-migration-plan.md` for the mapped Prisma module.
5. **Compliance Snapshot** – Capture residency/classification/audit requirements from `old/docs/requirements/02-security-and-compliance.md` and ensure the modern flow stores the same metadata.
6. **Plan of Record** – Before coding, outline the required contracts, service methods, and cache tags in the module README so future agents can reuse them.

## Finding Unimplemented Legacy Pieces

- Search `old/src` and `old/docs/qwen_cp_mix/**` for the feature name (e.g., "leave carry-over") to determine expected flows.
- Compare with current HR module folders. Missing counterparts should become TODO items with a reference to the legacy file.
- Check `docs/backend-function-manifest.json` to ensure every legacy function has a modern equivalent.
- When behavior is absent, document the gap inside the module's README (create one if needed) before writing code.
- Track gaps in a lightweight table (feature, legacy source, modern module, status) so future agents can pick them up quickly.

## When Adding a New HR Use Case

- Create `contracts`, `service`, and `api` slices rather than monolithic files; keep each under 250 LOC.
- Define shared DTOs or mappers under `src/server/repositories/mappers/hr` so other modules can adopt them.
- Reference tenant metadata (`orgId`, residency, classification) in every repository method signature.
- Prefer feature flags or config entries under `src/config` instead of hard-coded constants inside use-cases.
- Embed cache-tag guidance (what tag to register/invalidate) near each public method so later contributors know how to reuse it.
- Add runbook updates under `docs/runbooks/` when background jobs or integrations change behavior.

## Implementation Guardrails

- Never call Prisma directly from `use-cases`; always inject repositories via constructors for testability.
- Do not introduce `any`/`unknown`; define domain types under `src/server/types/hr` or extend existing ones.
- Avoid `console.log`; use `StructuredLogger` or the telemetry helpers already wired into services.
- Keep module-specific helpers local (e.g., `absences/helpers/validation.ts`) so other HR features can import them without diving into unrelated folders.
- After mutating data, call `invalidateOrgCache` (or a narrow helper) to keep Cache Components in sync.
- Favor generic helpers with explicit type parameters when multiple modules share logic (e.g., `buildScopedResponse<TPayload>`).

## Quality Gates & Lint

- Run `pnpm lint --filter orgcentral` before committing; markdown files must also satisfy repo markdownlint defaults (no trailing spaces, headings separated by blank lines).
- Execute targeted tests or `pnpm test --filter hr` when repositories or services change.
- For schema updates, follow `pnpm db:compose && pnpm db:generate` before running migrations.
- Update `docs/runbooks/file-connectivity-vectors.md` or other runbooks if your work affects automation or data exports.

## File Connectivity Maps

- Dependency telemetry for HR lives under `src/tools/file-connectivity/maps`. Today we ship two corpora: `hr-absences.ts` and `hr-leave.ts`. Each enumerates Prisma schemas, repository contracts/implementations, services, controllers, and Next.js routes so future agents can trace impact without re-reading the entire tree.
- When you add or rename HR files, update the appropriate map (or create a sibling) so the connectivity graph stays accurate. Keep summaries/tags concise and ensure related paths point to contracts rather than concrete implementations unless both are required.
- Regenerate cached vectors with `pnpm tsx scripts/generate-file-vectors.ts`; this writes JSON artifacts to `var/cache/file-connectivity/*.vectors.json` for CI and documentation tooling.
- Treat these maps as living documentation—cite them in module READMEs or reviews when explaining blast radius or required regression tests.

## Checklist

- [ ] Legacy reference reviewed and parity gaps noted.
- [ ] Repository contract + implementation updated (with cache invalidation hooks).
- [ ] Service extends `AbstractHrService` and uses structured logging helpers.
- [ ] Guards and cache tags applied to every entry point.
- [ ] Tests or runbooks updated to mention the new behavior.
