---
description: Run deployment readiness checks and deploy with explicit confirmation.
tools:
  - codebase
  - search
  - runCommands
  - problems
---

# /deploy

## Command
$ARGUMENTS

## Goal

Handle deployment or pre-deploy checks safely with explicit confirmation for risky steps.

## Modes

- `/deploy check`: run readiness checks only.
- `/deploy preview`: deploy to preview/staging.
- `/deploy production`: deploy to production (confirm before execution).
- `/deploy rollback`: rollback to previous stable release.

## Procedure

1. Inspect project deploy scripts/configuration.
2. Run pre-flight checks relevant to the repo.
3. Report pass/fail with blocking issues first.
4. Ask confirmation before production deployment or rollback.
5. Execute deployment command and summarize post-deploy health.

## Baseline Checks

```bash
npx tsc --noEmit
pnpm lint --fix
```

## Output

```markdown
## Deploy Report
- Mode:
- Target:

## Pre-flight
- check 1:
- check 2:

## Execution
- command:
- result:

## Health
- app:
- api:
- data:

## Rollback Plan
- trigger:
- command:
```
