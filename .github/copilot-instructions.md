# OrgCentral Copilot Instructions

Always read `.github/ARCHITECTURE.md` first, then apply these rules.

## Runtime And Delegation

- This workspace targets VS Code Copilot Chat on Windows (PowerShell default).
- Use subagents only when the task is clearly parallelizable or the user explicitly asks for multi-agent analysis.
- Subagents are stateless; delegate only small, bounded tasks with full context.
- Do not force recursive multi-agent planning loops.

## Code Quality

- Keep files under 250 LOC when practical; split early.
- Keep strict TypeScript: do not use `any` or `unknown` without narrowing and validation.
- Do not weaken ESLint rules without explicit approval.
- Prefer shared single sources of truth for constants, types, and config.

## Security And Compliance

- Validate and sanitize all external input at boundaries.
- Enforce tenant context (`orgId`, residency, classification) before data access.
- Apply ISO27001-aligned secure defaults, least privilege, and auditability.
- Never log secrets or sensitive personal data.

## Next.js And Data Flow

- Prefer Server Components first and keep client islands minimal.
- Use Zod for API/form/server-action boundaries.
- Route handlers stay thin and delegate to `src/server/api-adapters/**`.
- Prefer React Query for server state and cache invalidation.
- Use Zustand only for client-local persisted UI state via storage helpers.
- Avoid `router.refresh()` in client mutation flows; invalidate typed query keys instead.

## Workflow

- For complex or ambiguous changes: plan first, then implement.
- For clear/small changes: implement directly without orchestration overhead.
- For app QA/login testing: use seeded personas from `.codex/test-accounts/catalog.local.json` and run `pnpm seed:test-accounts:realistic:reset` before deep flow validation.
- Verify account states with `pnpm test-accounts:verify` and select personas by intended gate/state (ready, MFA-required, profile-required, suspended, no-membership).
- After code changes, run:
  - `npx tsc --noEmit`
  - `pnpm lint --fix`

## UI/UX Trigger

- If the user explicitly asks for `ui ux pro max` or `ui-ux-pro-max`, run that workflow and apply its stack-specific guidance.
