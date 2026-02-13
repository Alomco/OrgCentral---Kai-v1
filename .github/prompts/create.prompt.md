---
description: Create a new feature or application with planning-first execution.
tools:
  - codebase
  - search
  - editFiles
  - runCommands
  - problems
---

# /create

## Request
$ARGUMENTS

## Goal

Implement a new capability from scratch with a plan-first workflow and incremental verification.

## Procedure

1. Clarify missing essentials (users, core flows, constraints, stack).
2. Create a concise plan file (`PLAN-{slug}.md`) for multi-file work.
3. Implement in small batches with minimal blast radius.
4. Validate after each batch (types, lint, tests where relevant).
5. Summarize deliverables, validation, and follow-up tasks.

## Rules

- Prefer existing project patterns and architecture.
- Keep handlers thin and preserve adapter/service boundaries.
- Validate external input at boundaries.
- Avoid large speculative rewrites.

## Output

```markdown
## Create Report
- Scope:
- Plan file:

## Implementation Batches
1. Batch 1
2. Batch 2
3. Batch 3

## Validation
- npx tsc --noEmit:
- pnpm lint --fix:
- Tests:

## Result
- Completed:
- Remaining:
```
