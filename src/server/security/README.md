# Security & Compliance module

This folder groups security primitives and compliance scaffolding so the backend follows the requirements captured in `old/docs/requirements/02-security-and-compliance.md`. The structure favors modularity and reusability while keeping concrete code under 250 LOC per module.

## Layout
- `policies.ts` – central policy defaults (sessions, MFA, secrets, audit, residency) to avoid scattered constants.
- `authorization/` – ABAC and RBAC helpers that wrap existing guards without coupling to repositories.
- `authorization/session-access.ts` – bridges Better Auth sessions into guard-ready inputs and helpers (`withSessionAuthorization`, `requireSessionAuthorization`) for RBAC/ABAC checks.
- `data-protection/` – encryption middleware, residency tagging helpers, and SAR export skeletons.
- `compliance/` – job and rules stubs for Working Time Regs, pension auto-enrolment, and diversity analytics.
- `logging/` – immutable audit trace helpers and security-focused telemetry helpers.

## Usage guidelines
- Keep zero-trust: pass explicit org/user context into every helper; avoid hidden globals.
- Maintain composability: prefer pure evaluators that accept injected data sources (e.g., audit sinks, SAR writers).
- Rotate and version: centralize TTLs/rotation cadence in `policies.ts` to simplify future updates.
- Evidence first: produce audit/telemetry records alongside guards so compliance can be proven later.
- Expose auth safely: Better Auth is configured with the MCP plugin for OAuth-style MCP clients; route requests through guards using `buildOrgAccessInputFromSession`/`withSessionAuthorization` before hitting repositories.
- ABAC priority model: `AbacService` evaluates policies in priority order and the first matching policy (highest priority first) decides the outcome. There is no deny-override after a match, so ensure policies encode the desired precedence explicitly.
