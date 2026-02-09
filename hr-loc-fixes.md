# HR LOC Fixes Plan

## Goal
Split HR-related files that exceed 250 LOC into focused modules while preserving behavior and lint rules.

## Scope
- src/server/services/hr/people/__tests__/people-orchestration.service.test.ts
- src/app/(app)/hr/compliance/_components/compliance-templates-manager.tsx
- src/app/(app)/hr/onboarding/wizard/onboarding-wizard.hook.ts
- src/app/(app)/hr/reports/_components/reports-content.tsx

## Approach
1. Extract helper factories and fixtures into colocated modules.
2. Split UI sections and derived computations into small components/helpers.
3. Keep exports stable; update imports to new modules.
4. Re-run hr LOC lint and standard lint/type checks.

## Verification
- pnpm lint:hr-loc
- pnpm lint
- npx tsc --noEmit
