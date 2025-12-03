# HR People cache expectations

- Reads should register cache tags using `registerProfilesCache` / `registerContractsCache` so Next.js server components can rely on `cacheTags` and stay in sync across data residency/classification.
- Mutations must call `invalidateProfilesAfterMutation` or `invalidateContractsAfterMutation` with the active authorization context to revalidate `CACHE_SCOPE_PEOPLE_PROFILES` / `CACHE_SCOPE_PEOPLE_CONTRACTS`.
- Server components that fetch people data should wrap their loaders with `cacheTags([buildPeopleProfilesTag(...)])` or the contracts equivalent to align with the service-layer tags (mirrors the absences module pattern).
- Telemetry metadata now carries `cacheScope` for people operations to simplify debugging of stale-cache issues.

## TODO / Audit Checklist (with owners, priority, due)

- Profiles (Owner: Team X, P0, Due: 2025-12-12): validate create/get/list/update against legacy `old/src/lib/people/profile.ts`; confirm validators in `use-cases/hr/people/shared/profile-validators.ts` enforce residency/classification; ensure cache helpers in `services/hr/people/people-service.profile-operations.ts` register/invalidate tags. **Status:** cache registration + residency/classification propagation wired; legacy parity audit pending.
- Contracts (Owner: Team X, P0, Due: 2025-12-12): align service + repository + mapper (`services/hr/people/people-service.contract-operations.ts`, `repositories/prisma/hr/people/prisma-employment-contract-repository.ts`, `repositories/mappers/hr/people/employment-contract-mapper.ts`); verify date/JSON normalization; ensure contract list filters/tenancy checks mirror legacy. **Status:** cache registration + residency/classification propagation wired; legacy parity audit pending.
- Authorization (Owner: Team Y, P1, Due: 2025-12-19): audit `use-cases/hr/people/shared/repository-authorizer-helpers.ts` and service guards to cover all profile/contract endpoints; document gaps and required guard helpers. **Status:** guards in `guards-hr-people.ts` integrated via PeopleService runner; deeper gap analysis pending (legacy ABAC parity still to confirm).
- API adapters (Owner: Team Y, P1, Due: 2025-12-19): inventory HR people adapters (profiles + contracts) under `src/server/api-adapters/hr/people/**`; add missing adapters so routes go through services; document request/response DTOs. **Status:** adapters now call `getPeopleService()` with session-derived authorization; route/server-action integration still to verify; coverage added for provider + create profile adapter.
- Docs parity (Owner: Team Z, P1, Due: 2025-12-19): compare `docs/requirements/hr-*`, `docs/backend-function-manifest.json`, and `old/` people flows; record missing capabilities (profiles, contracts, onboarding) here with references for future implementation.

## Legacy Parity Audit (old vs modern)

- Legacy source: `../old/src/lib/hr/types.ts` and `../old/src/lib/hr/firestore.ts` (collections: employees, leaveRequests, unplannedAbsences, etc.). Employees carried richer profile data (contact details, address, emergency contacts, salary structure, employmentPeriods, skills/certifications, status flags, roles/eligibility lists).
- Modern profile DTO (`src/server/types/hr/people.ts`) now includes optional legacy fields for migration; keep them in `metadata.legacyProfile` unless promoted below.
- Column vs metadata decision (profiles):
  - **Remain in metadata.legacyProfile:** contact/address (email/personalEmail/phone/address), roles/eligibleLeaveTypes, status, employmentPeriods, salaryDetails, skills, certifications, legacy displayName/name fields.
  - **Columns already present:** employmentType, jobTitle, manager refs, salary/rates, dates, healthStatus, NI, emergencyContact, nextOfKin, workPermit, bankDetails, costCenter, location.
  - Migration plan: map legacy employee documents into Prisma `EmployeeProfile.metadata.legacyProfile` while populating existing columns where aligned (employmentType/jobTitle/start/end, identifiers).
- Contracts parity: legacy employment data lacked explicit contracts; modern contracts stand as canonical. Migration should derive contracts from legacy employment entries only if available; otherwise create baseline contracts during ingestion or leave empty.
- API surface: routes now implemented under `src/app/api/hr/people/**` (profiles list/create/get/update/delete; contracts list/create/get/update/delete) calling PeopleService via controllers.
